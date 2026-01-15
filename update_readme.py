"""批量更新APP目录下所有应用的README.md文件"""

import os
from datetime import datetime
import re
from functools import cmp_to_key
import subprocess
import json

class AppUpdateManager:
    """应用更新管理器，负责更新所有应用的README.md文件和生成应用数据"""
    
    def __init__(self):
        # 基础配置
        self.BASE_PATH = "app"
        self.CURRENT_DATE = datetime.now().strftime("%Y-%m-%d")
        self.GITHUB_REPO = "52liulian/tvapp_store"
        self.ICONS_DIR = "icons"
        self.IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp']
        
        # 编译正则表达式模式，提高性能
        self._compile_regex_patterns()
    
    def _compile_regex_patterns(self):
        """编译所有正则表达式模式，提高性能"""
        self.regex = {
            'full_version': re.compile(r"(\d+(?:\.\d+)+(?:-[^_]+)?)", re.IGNORECASE),
            'v_version': re.compile(r"V(\d+(?:\.\d+)+)", re.IGNORECASE),
            'number_sequence': re.compile(r"\d+(?:\.\d+)*"),
            'clean_name_version': re.compile(r'\s*v?\d+(\.\d+)*\s*', re.IGNORECASE),
            'clean_name_suffix': re.compile(r'\s*(电视版|TV版|手机版|兼容版|稳定版|修正版|修复版|内置版|魔改版|精简版|会员版|破解版|去广告版|永久版)\s*', re.IGNORECASE),
            'clean_name_special': re.compile(r'[^\w\s]'),
            'markdown_image': re.compile(r"!\[.*?\]\((.*?)\)"),
            'app_name': re.compile(r"应用名称：(.*)"),
            'version': re.compile(r"版本：(.*)"),
            'update_time': re.compile(r"更新时间：(.*)"),
            'app_size': re.compile(r"应用大小：(.*)"),
            'app_intro': re.compile(r"##应用介绍\s*(.*?)(?=##应用截图|\s*其它版本：|$)", re.DOTALL),
            'screenshots': re.compile(r"##应用截图\s*(.*?)(?=\s*其它版本：|$)", re.DOTALL),
            'other_versions': re.compile(r"其它版本：\s*(.*?)$", re.DOTALL),
            'category_app_intro': re.compile(r"##\s*([^\n]+)\n([^#]+)", re.DOTALL),
            'screenshot_path': re.compile(r"!\[.*?\]\(./app/[^/]+/[^/]+/([^/]+)/([^/]+)\)")
        }
    
    def read_category_readme(self, category_path):
        """读取分类目录下的README.md文件，提取应用介绍"""
        readme_path = os.path.join(category_path, "README.md")
        app_intros = {}
        
        if os.path.exists(readme_path):
            try:
                with open(readme_path, "r", encoding="utf-8") as f:
                    content = f.read()
                
                app_matches = self.regex['category_app_intro'].findall(content)
                for app_name, app_intro in app_matches:
                    app_name = app_name.strip()
                    app_intro = app_intro.strip()
                    app_intros[app_name] = app_intro
            except Exception as e:
                print(f"读取分类README.md失败：{readme_path}，错误：{e}")
        
        return app_intros
    
    def extract_version_from_filename(self, filename):
        """从APK文件名中提取版本号，支持多种格式"""
        filename_without_ext = filename[:-4] if filename.endswith('.apk') else filename
        
        # 优先匹配完整版本号模式
        full_version_match = self.regex['full_version'].search(filename_without_ext)
        if full_version_match:
            return full_version_match.group(1), filename
        
        # 匹配V前缀版本号
        v_version_match = self.regex['v_version'].search(filename_without_ext)
        if v_version_match:
            return f"V{v_version_match.group(1)}", filename
        
        # 提取最长数字序列
        number_sequences = self.regex['number_sequence'].findall(filename_without_ext)
        if number_sequences:
            longest_sequence = max(number_sequences, key=lambda x: len(x))
            return longest_sequence, filename
        
        return filename_without_ext, filename
    
    def compare_versions(self, version1, version2):
        """比较两个版本号，返回-1, 0, 1表示version1 < version2, ==, >"""
        def parse_version(version):
            """解析版本号为数字部分和后缀部分"""
            version = version[1:] if version.startswith("V") else version
            version_match = re.match(r"(\d+(?:\.\d+)*)(.*)", version)
            if version_match:
                main_version = version_match.group(1)
                suffix = version_match.group(2)
            else:
                return [0], version
            
            try:
                version_parts = list(map(int, main_version.split(".")))
                return version_parts, suffix
            except ValueError:
                return [0], version
        
        v1_parts, v1_suffix = parse_version(version1)
        v2_parts, v2_suffix = parse_version(version2)
        
        # 比较数字部分
        max_len = max(len(v1_parts), len(v2_parts))
        for i in range(max_len):
            v1 = v1_parts[i] if i < len(v1_parts) else 0
            v2 = v2_parts[i] if i < len(v2_parts) else 0
            
            if v1 < v2:
                return -1
            elif v1 > v2:
                return 1
        
        # 比较后缀
        if v1_suffix and not v2_suffix:
            return 1
        elif not v1_suffix and v2_suffix:
            return -1
        elif v1_suffix and v2_suffix:
            # 提取后缀中的所有数字，处理类似'1.4.1'的情况
            def extract_suffix_nums(suffix):
                """提取后缀中的所有数字，包括版本号"""
                nums = []
                # 找到所有数字序列
                for match in self.regex['number_sequence'].findall(suffix):
                    # 将版本号拆分为多个数字
                    parts = match.split('.')
                    nums.extend(map(int, parts))
                return nums
            
            v1_suffix_num = extract_suffix_nums(v1_suffix)
            v2_suffix_num = extract_suffix_nums(v2_suffix)
            
            max_suffix_len = max(len(v1_suffix_num), len(v2_suffix_num))
            for i in range(max_suffix_len):
                v1_suf = v1_suffix_num[i] if i < len(v1_suffix_num) else 0
                v2_suf = v2_suffix_num[i] if i < len(v2_suffix_num) else 0
                
                if v1_suf < v2_suf:
                    return -1
                elif v1_suf > v2_suf:
                    return 1
        
        return 0
    
    def format_file_size(self, size_bytes):
        """格式化文件大小为易读格式"""
        if size_bytes < 1024:
            return f"{size_bytes} B"
        elif size_bytes < 1024 * 1024:
            return f"{size_bytes / 1024:.2f} KB"
        elif size_bytes < 1024 * 1024 * 1024:
            return f"{size_bytes / (1024 * 1024):.2f} MB"
        else:
            return f"{size_bytes / (1024 * 1024 * 1024):.2f} GB"
    
    def get_version_info(self, app_path):
        """获取应用的版本信息，包括最新版本和历史版本"""
        apk_files = [f for f in os.listdir(app_path) if f.endswith(".apk")]
        if not apk_files:
            return "未知", "", "未知"
        
        version_info = []
        for apk in apk_files:
            version, _ = self.extract_version_from_filename(apk)
            apk_path_full = os.path.join(app_path, apk)
            file_size = os.path.getsize(apk_path_full)
            formatted_size = self.format_file_size(file_size)
            
            version_info.append({
                "filename": apk,
                "version": version,
                "size": formatted_size
            })
        
        # 按版本号排序，降序
        version_info.sort(key=cmp_to_key(lambda x, y: self.compare_versions(x["version"], y["version"])), reverse=True)
        
        latest_version = version_info[0]["version"]
        latest_size = version_info[0]["size"]
        
        history_versions = [f"{info['filename']}" for info in version_info[1:]]
        history_versions_str = "\n".join(history_versions) if history_versions else "无"
        
        return latest_version, history_versions_str, latest_size
    
    def parse_readme(self, readme_path):
        """解析应用目录下的README.md文件，提取应用信息"""
        try:
            with open(readme_path, "r", encoding="utf-8") as f:
                content = f.read()
            
            # 提取基本信息
            app_name = self._extract_value(self.regex['app_name'], content, "未知")
            version = self._extract_value(self.regex['version'], content, "未知")
            update_time = self._extract_value(self.regex['update_time'], content, "未知")
            size = self._extract_value(self.regex['app_size'], content, "未知")
            
            # 提取应用介绍
            app_intro = self._extract_value(self.regex['app_intro'], content, "暂无介绍", group=0)
            
            # 提取截图
            screenshots_content = self._extract_value(self.regex['screenshots'], content, "", group=0)
            screenshots = []
            if screenshots_content:
                matches = self.regex['markdown_image'].findall(screenshots_content)
                for url in matches:
                    if url.startswith("./"):
                        # 构建完整相对路径
                        app_name = os.path.basename(os.path.dirname(readme_path))
                        category = os.path.basename(os.path.dirname(os.path.dirname(readme_path)))
                        full_url = f"app/{category}/{app_name}/{url[2:]}"
                        screenshots.append(full_url)
                    else:
                        screenshots.append(url)
            
            # 提取其他版本
            other_versions = self._extract_value(self.regex['other_versions'], content, "无")
            
            return {
                "name": app_name,
                "version": version,
                "update_time": update_time,
                "size": size,
                "other_versions": other_versions,
                "app_intro": app_intro,
                "screenshots": screenshots
            }
        except Exception as e:
            print(f"解析README.md失败：{readme_path}，错误：{e}")
            return None
    
    def _extract_value(self, pattern, content, default="", group=0):
        """提取正则匹配值，支持指定分组"""
        match = pattern.search(content)
        if match:
            return match.group(group + 1).strip() if group >= 0 else match.group(1).strip()
        return default
    
    def get_screenshots(self, app_path, category, app_name):
        """获取应用目录下的截图文件"""
        screenshots = []
        image_dir = os.path.join(app_path, "images")
        image_dir_name = "images"
        
        if os.path.exists(image_dir) and os.path.isdir(image_dir):
            image_files = []
            for file in os.listdir(image_dir):
                file_path = os.path.join(image_dir, file)
                if os.path.isfile(file_path) and any(file.lower().endswith(ext) for ext in self.IMAGE_EXTENSIONS):
                    image_files.append(file)
            
            image_files.sort()
            
            for file in image_files:
                screenshots.append(f"![image](./app/{category}/{app_name}/{image_dir_name}/{file})")
        
        return screenshots
    
    def get_app_icon(self, app_path, category, app_name):
        """获取应用图标，优先从icons目录匹配"""
        if os.path.exists(self.ICONS_DIR):
            def clean_app_name(name):
                """清理应用名称，去除特殊字符和版本号"""
                name = name.replace('欧', '鸥')
                name = self.regex['clean_name_version'].sub(' ', name)
                name = self.regex['clean_name_suffix'].sub(' ', name)
                name = self.regex['clean_name_special'].sub(' ', name)
                name = re.sub(r'\s+', ' ', name).strip()
                return name.lower()
            
            cleaned_app_name = clean_app_name(app_name)
            best_match = None
            highest_score = 0
            
            for icon_file in os.listdir(self.ICONS_DIR):
                if any(icon_file.lower().endswith(ext) for ext in self.IMAGE_EXTENSIONS):
                    icon_name = os.path.splitext(icon_file)[0]
                    cleaned_icon_name = clean_app_name(icon_name)
                    
                    # 计算匹配分数
                    score = 0
                    if cleaned_app_name == cleaned_icon_name:
                        score = 100
                    elif cleaned_icon_name in cleaned_app_name:
                        score = 80
                    elif cleaned_app_name in cleaned_icon_name:
                        score = 70
                    else:
                        app_words = set(cleaned_app_name.split())
                        icon_words = set(cleaned_icon_name.split())
                        common_words = app_words.intersection(icon_words)
                        if common_words:
                            score = 50 + len(common_words) * 10
                    
                    # 更新最佳匹配
                    if score > highest_score:
                        highest_score = score
                        best_match = icon_file
                    elif score == highest_score and best_match:
                        if len(icon_name) < len(os.path.splitext(best_match)[0]):
                            best_match = icon_file
            
            if best_match and highest_score > 0:
                return f"icons/{best_match}"
        
        # 检查应用目录下的图标文件
        icon_filenames = ['icon.png', 'logo.png', 'ic_launcher.png', 'ic_launcher_round.png', '1.png']
        for icon_filename in icon_filenames:
            icon_path = os.path.join(app_path, icon_filename)
            if os.path.exists(icon_path):
                return f"app/{category}/{app_name}/{icon_filename}"
        
        # 检查应用目录下的所有图片文件
        for file in os.listdir(app_path):
            if any(file.lower().endswith(ext) for ext in self.IMAGE_EXTENSIONS):
                return f"app/{category}/{app_name}/{file}"
        
        # 检查images子目录
        for img_dir_name in ["images"]:
            image_dir = os.path.join(app_path, img_dir_name)
            if os.path.exists(image_dir) and os.path.isdir(image_dir):
                for file in os.listdir(image_dir):
                    if any(file.lower().endswith(ext) for ext in self.IMAGE_EXTENSIONS):
                        return f"app/{category}/{app_name}/{img_dir_name}/{file}"
        
        return "images/default_icon.png"
    
    def generate_app_data_js(self):
        """生成包含所有应用信息的JavaScript文件"""
        app_data = {}
        
        # 遍历所有分类和应用
        categories = os.listdir(self.BASE_PATH)
        for category in categories:
            category_path = os.path.join(self.BASE_PATH, category)
            if not os.path.isdir(category_path):
                continue
            
            app_data[category] = []
            
            apps = os.listdir(category_path)
            for app in apps:
                app_path = os.path.join(category_path, app)
                if not os.path.isdir(app_path):
                    continue
                
                readme_path = os.path.join(app_path, "README.md")
                if os.path.exists(readme_path):
                    app_info = self.parse_readme(readme_path)
                    if app_info:
                        # 补充截图信息
                        if not app_info.get("screenshots"):
                            screenshots = self.get_screenshots(app_path, category, app)
                            clean_screenshots = []
                            for screenshot in screenshots:
                                match = self.regex['markdown_image'].search(screenshot)
                                if match:
                                    clean_screenshots.append(match.group(1))
                                else:
                                    clean_screenshots.append(screenshot)
                            app_info["screenshots"] = clean_screenshots
                        
                        # 添加应用ID和图标
                        app_info["id"] = app.lower().replace(" ", "-").replace("_", "-")
                        app_info["icon"] = self.get_app_icon(app_path, category, app)
                        
                        # 兼容旧数据结构
                        if "app_intro" in app_info and "desc" not in app_info:
                            app_info["desc"] = app_info["app_intro"]
                        
                        # 处理APK下载链接
                        self._process_apk_downloads(app_info, app_path, category, app)
                        
                        app_data[category].append(app_info)
        
        # 生成JavaScript文件
        self._write_app_data_js(app_data)
    
    def _process_apk_downloads(self, app_info, app_path, category, app):
        """处理应用的APK下载链接"""
        apk_files = [f for f in os.listdir(app_path) if f.endswith(".apk")]
        if not apk_files:
            app_info["download_url"] = ""
            app_info["latest_apk"] = ""
            app_info["other_versions_list"] = []
            return
        
        # 处理所有APK文件
        all_apk_info = []
        for apk_file in apk_files:
            version, _ = self.extract_version_from_filename(apk_file)
            version_download_url = f"app/{category}/{app}/{apk_file}"
            all_apk_info.append({
                "filename": apk_file,
                "version": version,
                "download_url": version_download_url
            })
        
        # 排序APK文件
        all_apk_info.sort(key=cmp_to_key(lambda x, y: self.compare_versions(x["version"], y["version"])), reverse=True)
        
        # 设置最新版本
        latest_apk_info = all_apk_info[0]
        app_info["download_url"] = latest_apk_info["download_url"]
        app_info["latest_apk"] = latest_apk_info["filename"]
        
        # 处理其他版本
        other_versions = []
        for apk_info in all_apk_info[1:]:
            other_versions.append({
                "name": apk_info["filename"],
                "download_url": apk_info["download_url"],
                "filename": apk_info["filename"]
            })
        app_info["other_versions_list"] = other_versions
    
    def _write_app_data_js(self, app_data):
        """写入应用数据到JavaScript文件"""
        if not os.path.exists("js"):
            os.makedirs("js")
        
        js_path = "js/app_data.js"
        with open(js_path, "w", encoding="utf-8") as f:
            f.write("const appData = ")
            json.dump(app_data, f, ensure_ascii=False, indent=2)
            f.write(";")
        
        print(f"应用数据JavaScript文件已生成：{js_path}")
    
    def update_root_readme(self):
        """更新根目录README.md中的应用一览表"""
        print("\n更新根目录README.md中的应用一览表...")
        
        root_readme_path = "README.md"
        try:
            with open(root_readme_path, "r", encoding="utf-8") as f:
                content = f.read()
        except Exception as e:
            print(f"读取根目录README.md失败：{e}")
            return
        
        # 生成应用列表
        app_list = []
        categories = os.listdir(self.BASE_PATH)
        for category in categories:
            category_path = os.path.join(self.BASE_PATH, category)
            if not os.path.isdir(category_path):
                continue
            
            apps = os.listdir(category_path)
            for app in apps:
                app_path = os.path.join(category_path, app)
                if not os.path.isdir(app_path):
                    continue
                
                readme_path = os.path.join(app_path, "README.md")
                if os.path.exists(readme_path):
                    app_info = self.parse_readme(readme_path)
                    if app_info:
                        self._add_to_app_list(app_list, app_info, app_path, category, app)
        
        # 生成新的应用一览表
        new_table = self._generate_app_table(app_list)
        
        # 更新README.md
        self._update_readme_table(content, root_readme_path, new_table)
    
    def _add_to_app_list(self, app_list, app_info, app_path, category, app):
        """将应用添加到列表中"""
        apk_files = [f for f in os.listdir(app_path) if f.endswith(".apk")]
        if apk_files:
            all_apk_info = []
            for apk_file in apk_files:
                version, _ = self.extract_version_from_filename(apk_file)
                all_apk_info.append({
                    "filename": apk_file,
                    "version": version
                })
            
            all_apk_info.sort(key=cmp_to_key(lambda x, y: self.compare_versions(x["version"], y["version"])), reverse=True)
            latest_apk = all_apk_info[0]["filename"]
            download_url = f"app/{category}/{app}/{latest_apk}"
            
            app_list.append({
                "name": app_info["name"],
                "version": app_info["version"],
                "download_url": download_url,
                "category": category
            })
    
    def _generate_app_table(self, app_list):
        """生成应用一览表Markdown内容"""
        new_table = "| APP名称 | 版本 | 下载地址 | 状态 | 备注 |\n"
        new_table += "| ------- | ---- | -------- | ---- | ---- |\n"
        
        for app in app_list:
            new_table += f"| {app['name']} | {app['version']} | [下载]({app['download_url']}) | 🟢 |  |\n"
        
        return new_table
    
    def _update_readme_table(self, content, readme_path, new_table):
        """更新README.md中的应用一览表"""
        table_start = content.find("## 一览表 📂")
        if table_start == -1:
            print("未找到应用一览表部分")
            return
        
        next_header = content.find("## ", table_start + len("## 一览表 📂"))
        if next_header == -1:
            before_table = content[:table_start + len("## 一览表 📂")] + "\n\n"
            after_table = ""
        else:
            before_table = content[:table_start + len("## 一览表 📂")] + "\n\n"
            after_table = content[next_header:]
        
        new_content = before_table + new_table + after_table
        
        try:
            with open(readme_path, "w", encoding="utf-8") as f:
                f.write(new_content)
            print("根目录README.md中的应用一览表已更新！")
        except Exception as e:
            print(f"更新根目录README.md失败：{e}")
    
    def update_app_readmes(self):
        """更新所有应用的README.md文件"""
        categories = os.listdir(self.BASE_PATH)
        for category in categories:
            category_path = os.path.join(self.BASE_PATH, category)
            if not os.path.isdir(category_path):
                continue
            
            print(f"处理分类：{category}")
            category_app_intros = self.read_category_readme(category_path)
            
            apps = os.listdir(category_path)
            for app in apps:
                app_path = os.path.join(category_path, app)
                if not os.path.isdir(app_path):
                    continue
                
                # 获取版本信息
                version, history_versions, app_size = self.get_version_info(app_path)
                
                # 读取现有README
                readme_path = os.path.join(app_path, "README.md")
                existing_data = None
                if os.path.exists(readme_path):
                    existing_data = self.parse_readme(readme_path)
                
                # 获取截图
                screenshots_from_folder = self.get_screenshots(app_path, category, app)
                
                # 生成新的README内容
                self._generate_readme_content(app_path, app, version, history_versions, app_size, existing_data, screenshots_from_folder, category_app_intros)
    
    def _generate_readme_content(self, app_path, app, version, history_versions, app_size, existing_data, screenshots_from_folder, category_app_intros):
        """生成单个应用的README内容"""
        app_name = existing_data["name"] if existing_data else app
        update_time = existing_data["update_time"] if existing_data else self.CURRENT_DATE
        
        # 构建头部信息
        header_content = f"""应用名称：{app_name}
版本：{version}
更新时间：{update_time}
应用大小：{app_size}
"""
        
        # 应用介绍
        app_intro_content = self._generate_app_intro(app_name, existing_data, category_app_intros)
        
        # 应用截图
        screenshots_content = self._generate_screenshots_content(screenshots_from_folder, existing_data)
        
        # 其它版本
        other_versions_content = f"""其它版本：
{history_versions}
"""
        
        # 组合内容
        readme_content = header_content + app_intro_content + screenshots_content + other_versions_content
        
        # 写入文件
        readme_path = os.path.join(app_path, "README.md")
        with open(readme_path, "w", encoding="utf-8") as f:
            f.write(readme_content)
        
        print(f"  已更新：{readme_path}")
    
    def _generate_app_intro(self, app_name, existing_data, category_app_intros):
        """生成应用介绍部分"""
        if app_name in category_app_intros:
            return f"##应用介绍\n{category_app_intros[app_name]}\n\n"
        elif existing_data and existing_data.get("app_intro"):
            return f"##应用介绍\n{existing_data['app_intro']}\n\n"
        else:
            return f"##应用介绍\n{app_name}是一款功能丰富的应用程序。\n\n"
    
    def _generate_screenshots_content(self, screenshots_from_folder, existing_data):
        """生成应用截图部分"""
        if screenshots_from_folder:
            local_screenshots = []
            for screenshot in screenshots_from_folder:
                match = self.regex['screenshot_path'].search(screenshot)
                if match:
                    image_dir_name = match.group(1)
                    file_name = match.group(2)
                    local_screenshots.append(f"![image](./{image_dir_name}/{file_name})")
                else:
                    local_screenshots.append(screenshot)
            return "##应用截图\n" + "\n".join(local_screenshots) + "\n\n"
        elif existing_data and existing_data.get("screenshots"):
            return f"##应用截图\n{existing_data['screenshots']}\n\n"
        else:
            return "##应用截图\n![image](./images/1.png)\n![image](./images/2.png)\n\n"
    
    def test_version_processing(self):
        """测试版本号提取和比较功能"""
        print("开始测试版本号处理功能...")
        
        test_apks = [
            "影视仓电视版_5.0.40.1.apk",
            "影视仓电视版_6.0.3.apk",
            "影视仓电视版_6.1.0.apk",
            "影视仓电视版_6.1.1-32位.apk",
            "影视仓电视版_6.1.2-exo1.4.1修正无声，倍速.apk",
            "影视仓电视版_6.1.2-exo1.6.1修正无声倍速.apk",
            "影视仓电视版V3稳定版-3.0.32_兼容安卓4.apk",
            "影视仓电视版V3稳定版-3.0.36_兼容安卓4.apk"
        ]
        
        print("\n1. 测试版本号提取：")
        extracted_versions = []
        for apk in test_apks:
            version, _ = self.extract_version_from_filename(apk)
            extracted_versions.append((apk, version))
            print(f"   {apk} -> {version}")
        
        print("\n2. 测试版本号比较：")
        version_info = []
        for apk, version in extracted_versions:
            version_info.append({
                "filename": apk,
                "version": version
            })
        
        # 排序前
        print("   排序前：")
        for info in version_info:
            print(f"     {info['version']}")
        
        # 排序
        version_info.sort(key=cmp_to_key(lambda x, y: self.compare_versions(x["version"], y["version"])), reverse=True)
        
        # 排序后
        print("   排序后：")
        for info in version_info:
            print(f"     {info['version']} <- {info['filename']}")
        
        if version_info:
            print(f"\n3. 最新版本识别：")
            print(f"   最新版本：{version_info[0]['version']} ({version_info[0]['filename']})")
        
        print("\n版本号处理测试完成！")
        return True

# 主函数
def main():
    """主函数，执行所有更新操作"""
    manager = AppUpdateManager()
    
    # 更新所有应用的README.md文件
    manager.update_app_readmes()
    
    # 生成应用数据JavaScript文件
    manager.generate_app_data_js()
    
    # 生成帮助数据
    print("\n生成帮助数据...")
    subprocess.run(["python", "generate_help_data.py"], check=True)
    print("帮助数据生成完成！")
    
    # 更新根目录README.md中的应用一览表
    manager.update_root_readme()
    
    print("\n所有应用的README.md文件已更新完成！")

if __name__ == "__main__":
    # 先运行测试
    test_manager = AppUpdateManager()
    test_manager.test_version_processing()
    # 然后运行主程序
    main()