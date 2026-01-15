"""
根据help目录下的.md文件生成helpData，使用序号匹配对应图标
"""

import os
import re
import json
from datetime import datetime

# 基础路径
BASE_PATH = "."
HELP_DIR = os.path.join(BASE_PATH, "help")
IMAGES_DIR = os.path.join(BASE_PATH, "images")
JS_FILE = os.path.join(BASE_PATH, "js", "script.js")

# 读取单个MD文件的信息
def read_md_file(file_path, sequence_num=None):
    """读取MD文件，提取标题、描述和序号"""
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
        
        # 提取标题（第一个#标题）
        title_match = re.search(r"^# (.*)$", content, re.MULTILINE)
        title = title_match.group(1).strip() if title_match else os.path.basename(file_path)[:-3]
        
        # 提取描述（第一个段落）
        lines = [line.strip() for line in content.split("\n") if line.strip()]
        description = ""
        for line in lines:
            if not line.startswith("#") and not line.startswith("!"):
                description = line[:100] + ("..." if len(line) > 100 else "")
                break
        
        if not description:
            description = "暂无描述"
        
        # 获取文件修改时间
        mtime = os.path.getmtime(file_path)
        update_time = datetime.fromtimestamp(mtime).strftime("%Y/%m/%d")
        
        return {
            "title": title,
            "description": description,
            "update_time": update_time,
            "file": f"help/{os.path.basename(file_path)}",
            "sequence": sequence_num
        }
    except Exception as e:
        print(f"读取文件 {file_path} 时出错：{e}")
        return None

def extract_sequence_from_filename(filename):
    """从文件名中提取序号（如 '1.安装教程.md' -> 1）"""
    match = re.match(r"^(\d+)\.", filename)
    if match:
        return int(match.group(1))
    return None

def get_icon_by_sequence(sequence, images_dir):
    """根据序号匹配图标（如 1 -> help-1.png）"""
    if sequence is None:
        return None
    
    icon_filename = f"help-{sequence}.png"
    icon_path = os.path.join(images_dir, icon_filename)
    
    if os.path.exists(icon_path):
        return f"images/{icon_filename}"
    
    # 也尝试其他图片格式
    for ext in [".jpg", ".jpeg", ".webp", ".svg"]:
        alt_filename = f"help-{sequence}{ext}"
        alt_path = os.path.join(images_dir, alt_filename)
        if os.path.exists(alt_path):
            return f"images/{alt_filename}"
    
    return None

def get_icon_by_title(title, images_dir):
    """根据标题关键字匹配图标（备选方案）"""
    icon_map = {
        "IPTV": "IPTV.png",
        "TVBox": "TVBox.png",
        "常见问题": "常见问题.png",
        "应用安装": "应用安装.png",
        "影视仓": "影视仓.png"
    }
    
    for keyword, icon_file in icon_map.items():
        if keyword in title:
            full_path = os.path.join(images_dir, icon_file)
            if os.path.exists(full_path):
                return f"images/{icon_file}"
    
    return None

def generate_help_data():
    """生成helpData并更新到script.js文件"""
    # 读取images目录下的所有图片文件
    image_files = [f for f in os.listdir(IMAGES_DIR) if f.endswith((".png", ".jpg", ".jpeg", ".webp", ".svg"))]
    
    # 读取help目录下的所有.md文件（除了README.md）
    all_md_files = [f for f in os.listdir(HELP_DIR) if f.endswith(".md") and f != "README.md"]
    
    # 读取README.md文件，获取帮助主题顺序
    readme_path = os.path.join(HELP_DIR, "README.md")
    help_order = []
    if os.path.exists(readme_path):
        with open(readme_path, "r", encoding="utf-8") as f:
            lines = f.readlines()
        for line in lines:
            line = line.strip()
            if line:
                filename = line + ".md"
                help_order.append({"filename": filename})
    
    # 创建文件名到文件路径的映射
    filename_map = {}
    for md_file in all_md_files:
        filename_map[md_file.lower()] = md_file
    
    # 重新排序md文件，按照README中指定的顺序
    ordered_md_files = []
    for item in help_order:
        filename = item["filename"]
        lower_filename = filename.lower()
        if lower_filename in filename_map:
            ordered_md_files.append({
                "file": filename_map[lower_filename],
                "sequence": extract_sequence_from_filename(filename)
            })
            del filename_map[lower_filename]
    
    # 添加剩余的文件
    for md_file in sorted(filename_map.values()):
        ordered_md_files.append({
            "file": md_file,
            "sequence": extract_sequence_from_filename(md_file)
        })
    
    # 读取每个MD文件的信息
    help_data = []
    for item in ordered_md_files:
        md_file = item["file"]
        sequence = item["sequence"]
        
        file_path = os.path.join(HELP_DIR, md_file)
        help_info = read_md_file(file_path, sequence)
        
        if help_info:
            help_info["id"] = len(help_data)
            
            # 优先根据序号匹配图标
            icon = get_icon_by_sequence(sequence, IMAGES_DIR)
            
            # 如果序号匹配失败，根据标题关键字匹配
            if not icon:
                icon = get_icon_by_title(help_info["title"], IMAGES_DIR)
            
            # 如果都没有匹配到，使用默认图标
            if not icon:
                icon = "images/help-0.png"
            
            help_info["icon"] = icon
            help_data.append(help_info)
    
    # 读取script.js文件
    with open(JS_FILE, "r", encoding="utf-8") as f:
        js_content = f.read()
    
    # 生成helpData的JSON字符串
    help_data_json = json.dumps(help_data, ensure_ascii=False, indent=2)
    
    # 替换script.js中的helpData
    help_data_pattern = r"const helpData = \[.*?\];"
    updated_js_content = re.sub(help_data_pattern, f"const helpData = {help_data_json};", js_content, flags=re.DOTALL)
    
    # 写入更新后的script.js文件
    with open(JS_FILE, "w", encoding="utf-8") as f:
        f.write(updated_js_content)
    
    print(f"helpData已更新到 {JS_FILE}")
    print(f"共生成 {len(help_data)} 个帮助主题")

if __name__ == "__main__":
    generate_help_data()
