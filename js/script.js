// 应用分类数据
const categories = [
    { id: 'video', name: '影视点播' },
    { id: 'live', name: '电视直播' },
    { id: 'ktv', name: 'K歌软件' },
    { id: 'movement', name: '运动健身' },
    { id: 'entertainment', name: '娱乐应用' },
    { id: 'education', name: '教育学习' },
    { id: 'utility', name: '实用工具' },
    { id: 'help', name: '帮助中心' }
];

// 当前选中的分类
let currentCategory = 'video';
// 当前选中的应用
let currentApp = null;
// 当前焦点位置
let focusIndex = 0;
// 当前焦点所在区域：'nav' 或 'content' 或 'detail'
let focusArea = 'nav';
// 当前焦点按钮索引
let focusedBtnIndex = -1;
// 保存的焦点状态，用于返回时恢复
let savedFocusState = {
    focusArea: 'nav',
    focusIndex: 0
};

// 初始化页面
function init() {
    renderCategories();
    if (currentCategory === 'help') {
        renderHelpList();
    } else {
        renderAppList(currentCategory);
    }
    setupKeyboardNavigation();
    setupScrollListener();
    console.log('应用数据加载成功：', appData);
}

// 设置滚动监听器
function setupScrollListener() {
    const appList = document.getElementById('appList');
    appList.addEventListener('scroll', () => {
        // 检查是否在详情页面
        const detailSection = document.querySelector('.detail-section');
        const isDetailPage = detailSection !== null;
        
        if (isDetailPage) {
            // 在详情页面，滚动时更新焦点按钮
            updateFocusedButtonOnScroll();
        }
    });
}

// 渲染分类导航
function renderCategories() {
    const categoryNav = document.getElementById('categoryNav');
    categoryNav.innerHTML = categories.map(category => `
        <div class="category-item ${category.id === currentCategory ? 'active' : ''}" data-id="${category.id}">
            ${category.name}
        </div>
    `).join('');
    
    // 添加分类点击事件
    categoryNav.querySelectorAll('.category-item').forEach(item => {
        item.addEventListener('click', () => {
            const categoryId = item.dataset.id;
            switchCategory(categoryId);
        });
    });
    
    // 设置焦点到导航栏
    if (focusArea === 'nav') {
        const categoryItems = categoryNav.querySelectorAll('.category-item');
        const currentIndex = categories.findIndex(c => c.id === currentCategory);
        categoryItems.forEach(item => item.classList.remove('focused'));
        categoryItems[currentIndex]?.classList.add('focused');
    }
}

// 切换分类
function switchCategory(categoryId) {
    currentCategory = categoryId;
    focusIndex = 0;
    renderCategories();
    if (categoryId === 'help') {
        renderHelpList();
    } else {
        renderAppList(categoryId);
    }
    // 切换分类后，焦点仍然在导航栏上
    updateFocus();
    
    // 切换分类时隐藏详情
    clearDetail();
}

// 渲染应用列表
function renderAppList(categoryId) {
    const appList = document.getElementById('appList');
    const apps = appData[categoryId] || [];
    
    if (apps.length === 0) {
        appList.innerHTML = '<div class="no-data">该分类下暂无应用</div>';
        return;
    }
    
    appList.innerHTML = `
        <div class="app-grid">
            ${apps.map(app => `
                <div class="app-card" data-id="${app.id}">
                    <div class="app-header">
                        <div class="app-icon">
                            <img src="${app.icon || 'https://via.placeholder.com/100'}" alt="${app.name}图标">
                        </div>
                        <div class="app-info">
                            <div class="app-name">${app.name}</div>
                            <div class="app-meta">
                                <span class="app-version">版本：${app.version}</span>
                                <span class="app-date">更新：${app.update_time}</span>
                            </div>
                        </div>
                    </div>
                    <div class="app-desc">${app.desc}</div>
                </div>
            `).join('')}
        </div>
    `;
    
    // 添加应用点击事件
    appList.querySelectorAll('.app-card').forEach(item => {
        item.addEventListener('click', () => {
            const appId = item.dataset.id;
            showAppDetail(appId, categoryId);
        });
    });
}

// 渲染帮助列表
function renderHelpList() {
    const appList = document.getElementById('appList');
    
    // 帮助中心数据
    const helpData = [
  {
    "title": "TV应用安装图文指南",
    "description": "本文提供了多种在电视盒子上安装应用的方法，包括U盘安装、网络安装等，适合不同场景使用。",
    "update_time": "2026/01/14",
    "file": "help/1.应用安装图文指南.md",
    "sequence": 1,
    "id": 0,
    "icon": "images/help-1.png"
  },
  {
    "title": "TV应用商店常见问题汇总及解答",
    "description": "本文汇总了使用TV应用商店过程中遇到的常见问题及解决方案，希望能帮助您顺利使用我们的服务。",
    "update_time": "2026/01/14",
    "file": "help/2.常见问题汇总及解答.md",
    "sequence": 2,
    "id": 1,
    "icon": "images/help-2.png"
  },
  {
    "title": "TVBox配置指南及接口地址（2026最新）",
    "description": "TVBox是一款功能强大的电视盒子播放器，支持多种接口源和播放格式，提供流畅的观影体验。本文将详细介绍TVBox的配置方法和最新可用的接口地址。",
    "update_time": "2026/01/14",
    "file": "help/3.TVBox配置指南及接口地址.md",
    "sequence": 3,
    "id": 2,
    "icon": "images/help-3.png"
  },
  {
    "title": "影视仓配置指南及接口地址（亲测最新可用）",
    "description": "影视仓是一款非常优秀的开源影视播放器，目前主要支持安卓手机和电视盒子。影视仓软件可以通过简单的接口配置即可实现私人影院，不但内容覆盖全面，更有许多4K高清的内容源。",
    "update_time": "2026/01/14",
    "file": "help/4.影视仓配置指南及接口地址.md",
    "sequence": 4,
    "id": 3,
    "icon": "images/help-4.png"
  },
  {
    "title": "IPTV直播源汇总（附iOS、Android、macOS、Windows软件推荐）",
    "description": "IPTV网络电视直播是目前一种流行的电视观看方式，比起传统电视更加「移动化」。无论你选用什么设备，只需要添加一个IPTV直播源（IPV6源）就可以实现自由观看网络电视直播。",
    "update_time": "2026/01/13",
    "file": "help/5.IPTV直播源汇总.md",
    "sequence": 5,
    "id": 4,
    "icon": "images/help-5.png"
  },
  {
    "title": "各品牌设备安装第三方软件教程",
    "description": "本文提供了多种品牌电视、投影、盒子安装第三方软件的详细教程，包括海尔、海信、极米、华为&荣耀、天猫魔盒、小米、创维&酷开、TCL&雷鸟、索尼、东芝、OPPO等品牌。",
    "update_time": "2026/01/14",
    "file": "help/6.各品牌设备安装第三方软件教程.md",
    "sequence": 6,
    "id": 5,
    "icon": "images/help-6.png"
  },
  {
    "title": "一文搞懂接口源：单线路、多线路(单仓)、多仓概念",
    "description": "本文详细介绍了TVBox、影视仓等软件中接口源的相关概念，包括单线路、多线路(单仓)、多仓的区别，帮助您更好地理解和使用这些软件。",
    "update_time": "2026/01/14",
    "file": "help/7.一文搞懂接口源：单线路、多线路(单仓)、多仓概念.md",
    "sequence": 7,
    "id": 6,
    "icon": "images/help-7.png"
  }
];
    
    appList.innerHTML = `
        <div class="app-grid">
            ${helpData.map(help => `
                <div class="app-card" data-id="${help.id}">
                    <div class="app-header">
                        <div class="app-icon">
                            <img src="${help.icon}" alt="${help.title}">
                        </div>
                        <div class="app-info">
                            <div class="app-name">${help.title}</div>
                            <div class="app-meta">
                                <span class="app-date">更新：${help.update_time}</span>
                            </div>
                        </div>
                    </div>
                    <div class="app-desc">${help.description}</div>
                </div>
            `).join('')}
        </div>
    `;
    
    // 添加帮助点击事件
    appList.querySelectorAll('.app-card').forEach(item => {
        item.addEventListener('click', () => {
            const helpId = parseInt(item.dataset.id);
            const help = helpData.find(h => h.id === helpId);
            if (help) {
                showHelpDetail(help);
            }
        });
    });
}

// 显示应用详情
function showAppDetail(appId, categoryId) {
    const appList = document.getElementById('appList');
    const apps = appData[categoryId] || [];
    const app = apps.find(a => a.id === appId);
    
    if (!app) return;
    
    // 保存当前焦点状态
    savedFocusState = {
        focusArea: focusArea,
        focusIndex: focusIndex
    };
    
    currentApp = app;
    // 设置焦点区域为详情页
    focusArea = 'detail';
    
    appList.innerHTML = `
        <div class="detail-section detail-info-container">
            <div class="detail-title-wrapper">
                <div class="detail-title">${app.name}</div>
            </div>
            <div class="detail-content-wrapper">
                <div class="app-icon-detail">
                    <img src="${app.icon}" alt="${app.name}图标" class="detail-icon">
                </div>
                <div class="detail-info-wrapper">
                    <div class="detail-info"><span class="detail-label">最新版本：</span><span class="detail-value">${app.version}</span></div>
                    <div class="detail-info"><span class="detail-label">更新时间：</span><span class="detail-value">${app.update_time}</span></div>
                    <div class="detail-info"><span class="detail-label">应用大小：</span><span class="detail-value">${app.size}</span></div>
                </div>
                ${app.download_url ? `
                <div class="detail-download-container">
                    <a href="${app.download_url}" target="_blank" class="download-button">
                        安装应用
                    </a>
                </div>
                ` : ''}
            </div>
        </div>
        <div class="detail-section">
            <div class="detail-title">应用介绍</div>
            <div class="detail-desc">${app.desc}</div>
        </div>
        ${app.screenshots && app.screenshots.length > 0 ? `
        <div class="detail-section">
            <div class="detail-title">应用截图</div>
            <div id="snapShotWrap" class="snapShotWrap" style="height: 225px;">
                <a rel="nofollow" id="shotNext" class="snap-shot-btn next" title="下一张" href="javascript:void(0);"><i></i></a>
                <a rel="nofollow" id="shotPrev" class="snap-shot-btn prev" title="上一张" href="javascript:void(0);"> <i></i> </a>
                <div class="snapShotCont" style="height: 225px;">
                    ${app.screenshots.map((screenshot, index) => `
                        <div class="snopshot" id="snopshot${index + 1}" data-index="${index}">
                            <img src="${screenshot}" alt="${app.name}截图" style="max-width: 400px; max-height: 225px;">
                            <span class="elementOverlay"></span>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
        ` : ''}
        ${app.other_versions_list && app.other_versions_list.length > 0 ? `
        <div class="detail-section">
            <div class="detail-title">其他版本</div>
            <div class="other-versions-list">
                ${app.other_versions_list.map(version => `
                    <div class="other-version-item">
                        <div class="version-name">${version.name}</div>
                        <a href="${version.download_url}" target="_blank" class="download-button-small">
                            安装应用
                        </a>
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}
    `;
    
    // 初始化轮播功能
    function initCarousel() {
        const snapShotWrap = document.getElementById('snapShotWrap');
        if (!snapShotWrap) return;
        
        const snapShotCont = snapShotWrap.querySelector('.snapShotCont');
        const snapShots = snapShotWrap.querySelectorAll('.snopshot');
        if (snapShots.length === 0) return;
        
        const prevBtn = document.getElementById('shotPrev');
        const nextBtn = document.getElementById('shotNext');
        
        let currentIndex = 0;
        let autoPlayInterval = null;
        const AUTO_PLAY_TIME = 3000; // 自动播放间隔（毫秒）
        
        console.log('3D轮播初始化:', { 
            itemsCount: snapShots.length 
        });
        
        // 更新3D轮播显示
        function update3DCarousel() {
            console.log('更新3D轮播:', currentIndex);
            
            // 确保currentIndex在有效范围内
            currentIndex = (currentIndex + snapShots.length) % snapShots.length;
            
            // 获取轮播容器的实际宽度
            const containerWidth = snapShotWrap.offsetWidth;
            const containerHeight = snapShotWrap.offsetHeight;
            
            // 计算中心位置
            const centerX = containerWidth / 2;
            
            // 计算每个快照的位置和样式
            snapShots.forEach((snapShot, index) => {
                // 计算相对于当前索引的位置
                const position = (index - currentIndex + snapShots.length) % snapShots.length;
                
                // 定义不同位置的样式
                let style = {};
                
                // 对于少于5张图片的情况，我们需要调整位置计算
                const totalVisible = Math.min(5, snapShots.length);
                
                if (totalVisible === 1) {
                    // 只有一张图片，始终显示在中心
                    const imgWidth = 400;
                    const imgHeight = 225;
                    style = {
                        width: `${imgWidth}px`,
                        opacity: 1,
                        left: `${centerX - imgWidth / 2}px`,
                        zIndex: 3,
                        marginTop: '0px',
                        height: `${imgHeight}px`
                    };
                } else if (totalVisible === 2) {
                    // 两张图片：中心和右侧
                    const centerImgWidth = 400;
                    const centerImgHeight = 225;
                    const sideImgWidth = 333;
                    const sideImgHeight = 187.5;
                    
                    switch (position) {
                        case 0: // 中心
                            style = {
                                width: `${centerImgWidth}px`,
                                opacity: 1,
                                left: `${centerX - centerImgWidth / 2}px`,
                                zIndex: 3,
                                marginTop: '0px',
                                height: `${centerImgHeight}px`
                            };
                            break;
                        case 1: // 右侧
                            style = {
                                width: `${sideImgWidth}px`,
                                opacity: 1,
                                left: `${centerX + centerImgWidth / 2 - 50}px`,
                                zIndex: 0,
                                marginTop: `${(centerImgHeight - sideImgHeight) / 2}px`,
                                height: `${sideImgHeight}px`
                            };
                            break;
                        default:
                            style = {
                                width: '0px',
                                opacity: 0,
                                left: `${centerX}px`,
                                zIndex: 0,
                                marginTop: '135px',
                                height: '0px'
                            };
                            break;
                    }
                } else if (totalVisible === 3) {
                    // 三张图片：左侧、中心、右侧
                    const centerImgWidth = 400;
                    const centerImgHeight = 225;
                    const sideImgWidth = 333;
                    const sideImgHeight = 187.5;
                    
                    switch (position) {
                        case 0: // 中心
                            style = {
                                width: `${centerImgWidth}px`,
                                opacity: 1,
                                left: `${centerX - centerImgWidth / 2}px`,
                                zIndex: 3,
                                marginTop: '0px',
                                height: `${centerImgHeight}px`
                            };
                            break;
                        case 1: // 右侧
                            style = {
                                width: `${sideImgWidth}px`,
                                opacity: 1,
                                left: `${centerX + centerImgWidth / 2 - 50}px`,
                                zIndex: 0,
                                marginTop: `${(centerImgHeight - sideImgHeight) / 2}px`,
                                height: `${sideImgHeight}px`
                            };
                            break;
                        case 2: // 左侧
                            style = {
                                width: `${sideImgWidth}px`,
                                opacity: 1,
                                left: `${centerX - centerImgWidth / 2 - sideImgWidth + 50}px`,
                                zIndex: 0,
                                marginTop: `${(centerImgHeight - sideImgHeight) / 2}px`,
                                height: `${sideImgHeight}px`
                            };
                            break;
                        default:
                            style = {
                                width: '0px',
                                opacity: 0,
                                left: `${centerX}px`,
                                zIndex: 0,
                                marginTop: '135px',
                                height: '0px'
                            };
                            break;
                    }
                } else if (totalVisible === 4) {
                    // 四张图片：左侧第二张、左侧第一张、中心、右侧
                    const centerImgWidth = 400;
                    const centerImgHeight = 225;
                    const sideImgWidth = 333;
                    const sideImgHeight = 187.5;
                    
                    switch (position) {
                        case 0: // 中心
                            style = {
                                width: `${centerImgWidth}px`,
                                opacity: 1,
                                left: `${centerX - centerImgWidth / 2}px`,
                                zIndex: 3,
                                marginTop: '0px',
                                height: `${centerImgHeight}px`
                            };
                            break;
                        case 1: // 右侧
                            style = {
                                width: `${sideImgWidth}px`,
                                opacity: 1,
                                left: `${centerX + centerImgWidth / 2 - 50}px`,
                                zIndex: 0,
                                marginTop: `${(centerImgHeight - sideImgHeight) / 2}px`,
                                height: `${sideImgHeight}px`
                            };
                            break;
                        case 3: // 左侧第一张
                            style = {
                                width: `${sideImgWidth}px`,
                                opacity: 1,
                                left: `${centerX - centerImgWidth / 2 - sideImgWidth + 50}px`,
                                zIndex: 0,
                                marginTop: `${(centerImgHeight - sideImgHeight) / 2}px`,
                                height: `${sideImgHeight}px`
                            };
                            break;
                        default:
                            style = {
                                width: '0px',
                                opacity: 0,
                                left: `${centerX}px`,
                                zIndex: 0,
                                marginTop: '135px',
                                height: '0px'
                            };
                            break;
                    }
                } else {
                    // 五张或更多图片，完整的3D效果
                    const centerImgWidth = 400;
                    const centerImgHeight = 225;
                    const sideImgWidth = 333;
                    const sideImgHeight = 187.5;
                    
                    switch (position) {
                        case 0: // 中心位置
                            style = {
                                width: `${centerImgWidth}px`,
                                opacity: 1,
                                left: `${centerX - centerImgWidth / 2}px`,
                                zIndex: 3,
                                marginTop: '0px',
                                height: `${centerImgHeight}px`
                            };
                            break;
                        case 1: // 右侧第一张
                            style = {
                                width: `${sideImgWidth}px`,
                                opacity: 1,
                                left: `${centerX + centerImgWidth / 2 - 50}px`,
                                zIndex: 0,
                                marginTop: `${(centerImgHeight - sideImgHeight) / 2}px`,
                                height: `${sideImgHeight}px`
                            };
                            break;
                        case 2: // 右侧第二张
                            style = {
                                width: '0px',
                                opacity: 0,
                                left: `${centerX + centerImgWidth / 2 + sideImgWidth}px`,
                                zIndex: 0,
                                marginTop: `${(centerImgHeight - 0) / 2}px`,
                                height: '0px'
                            };
                            break;
                        case 3: // 左侧第二张
                            style = {
                                width: '0px',
                                opacity: 0,
                                left: `${centerX - centerImgWidth / 2 - sideImgWidth}px`,
                                zIndex: 0,
                                marginTop: `${(centerImgHeight - 0) / 2}px`,
                                height: '0px'
                            };
                            break;
                        case 4: // 左侧第一张
                            style = {
                                width: `${sideImgWidth}px`,
                                opacity: 1,
                                left: `${centerX - centerImgWidth / 2 - sideImgWidth + 50}px`,
                                zIndex: 0,
                                marginTop: `${(centerImgHeight - sideImgHeight) / 2}px`,
                                height: `${sideImgHeight}px`
                            };
                            break;
                        default: // 其他位置隐藏
                            style = {
                                width: '0px',
                                opacity: 0,
                                left: `${centerX}px`,
                                zIndex: 0,
                                marginTop: `${(centerImgHeight - 0) / 2}px`,
                                height: '0px'
                            };
                            break;
                    }
                }
                
                // 应用样式
                Object.keys(style).forEach(prop => {
                    snapShot.style[prop] = style[prop];
                });
            });
        }
        
        // 上一张
        function prevSlide() {
            currentIndex = (currentIndex - 1 + snapShots.length) % snapShots.length;
            update3DCarousel();
        }
        
        // 下一张
        function nextSlide() {
            currentIndex = (currentIndex + 1) % snapShots.length;
            update3DCarousel();
        }
        
        // 开始自动播放
        function startAutoPlay() {
            stopAutoPlay();
            autoPlayInterval = setInterval(nextSlide, AUTO_PLAY_TIME);
        }
        
        // 停止自动播放
        function stopAutoPlay() {
            if (autoPlayInterval) {
                clearInterval(autoPlayInterval);
                autoPlayInterval = null;
            }
        }
        
        // 事件监听
        prevBtn.addEventListener('click', () => {
            console.log('点击上一张');
            prevSlide();
            startAutoPlay(); // 点击后重新开始自动播放
        });
        
        nextBtn.addEventListener('click', () => {
            console.log('点击下一张');
            nextSlide();
            startAutoPlay(); // 点击后重新开始自动播放
        });
        
        // 鼠标悬停时停止自动播放，离开时重新开始
        snapShotWrap.addEventListener('mouseenter', stopAutoPlay);
        snapShotWrap.addEventListener('mouseleave', startAutoPlay);
        
        // 初始化3D轮播显示
        update3DCarousel();
        
        // 开始自动播放
        startAutoPlay();
        
        console.log('3D轮播初始化完成');
    }
    
    // 确保DOM渲染完成后初始化轮播
    setTimeout(() => {
        const copyButtons = document.querySelectorAll('.copy-btn');
        const installButtons = document.querySelectorAll('.download-button, .download-button-small');
        const allFocusableButtons = [...copyButtons, ...installButtons];
        
        if (allFocusableButtons.length > 0) {
            allFocusableButtons.forEach(btn => btn.classList.remove('focused'));
            allFocusableButtons[0].classList.add('focused');
            // 初始化全局焦点按钮索引
            focusedBtnIndex = 0;
        } else {
            // 如果没有可聚焦按钮，重置焦点索引
            focusedBtnIndex = -1;
        }
        
        // 初始化轮播功能
        initCarousel();
    }, 10);
}

// 显示帮助详情
async function showHelpDetail(help) {
    const appList = document.getElementById('appList');
    // 保存当前焦点状态
    savedFocusState = {
        focusArea: focusArea,
        focusIndex: focusIndex
    };
    // 设置焦点区域为详情页
    focusArea = 'detail';
    
    appList.innerHTML = `
        <div class="detail-section">
            <div class="detail-title">${help.title}</div>
            <div class="markdown-content" id="markdownContent"></div>
        </div>
    `;
    
    try {
        // 读取MD文件
        const response = await fetch(help.file);
        if (!response.ok) {
            throw new Error('文件加载失败');
        }
        const mdContent = await response.text();
        
        // 简单的Markdown渲染
        renderMarkdown(mdContent, document.getElementById('markdownContent'));
        
        // 设置焦点到第一个可聚焦按钮
        setTimeout(() => {
            const copyButtons = document.querySelectorAll('.copy-btn');
            const installButtons = document.querySelectorAll('.download-button, .download-button-small');
            const allFocusableButtons = [...copyButtons, ...installButtons];
            if (allFocusableButtons.length > 0) {
                allFocusableButtons.forEach(btn => btn.classList.remove('focused'));
                allFocusableButtons[0].classList.add('focused');
                // 初始化全局焦点按钮索引
                focusedBtnIndex = 0;
            } else {
                // 如果没有可聚焦按钮，重置焦点索引
                focusedBtnIndex = -1;
            }
        }, 100);
    } catch (error) {
        document.getElementById('markdownContent').innerHTML = `<p>抱歉，无法加载该帮助内容：${error.message}</p>`;
    }
}

// 简单的Markdown渲染
function renderMarkdown(md, container) {
    // 删除最近更新行
    md = md.replace(/^## 最近更新：.*$/gm, '');
    
    // 先删除一级标题行
    md = md.replace(/^# (.*$)/gm, '');
    // 替换标题，支持多级标题
    md = md.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    md = md.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    md = md.replace(/^#### (.*$)/gm, '<h4>$1</h4>');
    md = md.replace(/^##### (.*$)/gm, '<h5>$1</h5>');
    md = md.replace(/^###### (.*$)/gm, '<h6>$1</h6>');
    
    // 替换粗体
    md = md.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // 1. 先处理所有链接，将其转换为特殊标记，避免影响列表处理
    const links = [];
    const linkPattern = /(https?:\/\/[^\s]+)/g;
    md = md.replace(linkPattern, (match) => {
        const id = `__LINK__${links.length}__`;
        links.push(match);
        return id;
    });
    
    // 2. 处理嵌套列表
    // 先处理最深层的列表，然后逐步向外处理
    let processed = false;
    let depth = 0;
    
    while (!processed && depth < 10) {
        processed = true;
        
        // 处理嵌套的无序列表
        let nestedUlPattern = /(<li>.*?)(\n\s+- .+)/g;
        if (nestedUlPattern.test(md)) {
            processed = false;
            md = md.replace(nestedUlPattern, (match, liContent, nestedItems) => {
                // 提取嵌套列表项
                let nestedLines = nestedItems.split('\n').filter(line => line.trim() !== '');
                let nestedListItems = nestedLines.map(line => {
                    let content = line.replace(/^\s+- /, '');
                    return `<li>${content}</li>`;
                }).join('');
                return `${liContent}<ul>${nestedListItems}</ul>`;
            });
        }
        
        // 处理嵌套的有序列表
        let nestedOlPattern = /(<li>.*?)(\n\s*\d+\. .+)/g;
        if (nestedOlPattern.test(md)) {
            processed = false;
            md = md.replace(nestedOlPattern, (match, liContent, nestedItems) => {
                // 提取嵌套列表项
                let nestedLines = nestedItems.split('\n').filter(line => line.trim() !== '');
                let nestedListItems = nestedLines.map(line => {
                    let content = line.replace(/^\s*\d+\. /, '');
                    return `<li>${content}</li>`;
                }).join('');
                return `${liContent}<ol>${nestedListItems}</ol>`;
            });
        }
        
        depth++;
    }
    
    // 处理顶级无序列表
    let ulPattern = /(^\s*- .+$)/gm;
    md = md.replace(ulPattern, '<li>$1</li>');
    // 将连续的li标签包装成ul
    md = md.replace(/<li>\s*- (.+)<\/li>(\n<li>\s*- (.+)<\/li>)+/g, '<ul>$&</ul>');
    // 移除li标签内的列表标记
    md = md.replace(/<li>\s*- /g, '<li>');
    
    // 处理顶级有序列表
    let olPattern = /(^\s*\d+\. .+$)/gm;
    md = md.replace(olPattern, '<li>$1</li>');
    // 将连续的li标签包装成ol
    md = md.replace(/<li>\s*\d+\. (.+)<\/li>(\n<li>\s*\d+\. (.+)<\/li>)+/g, '<ol>$&</ol>');
    // 移除li标签内的列表标记
    md = md.replace(/<li>\s*\d+\. /g, '<li>');
    
    // 3. 将特殊标记替换回链接，添加一键复制功能
    md = md.replace(/__LINK__(\d+)__/g, (match, id) => {
        const url = links[parseInt(id)];
        return `<div class="copyable-link"><span class="link-text">${url}</span><button class="copy-btn" data-url="${url}">复制</button></div>`;
    });
    
    // 替换段落，确保不会影响已处理的标签，并且只处理非空行
    md = md.replace(/^(?!<h|<ul|<ol|<li|<div|<p).+$/gm, '<p>$&</p>');
    // 移除多余的空段落
    md = md.replace(/<p>\s*<\/p>/g, '');
    
    container.innerHTML = md;
    
    // 添加复制按钮点击事件
    container.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const url = btn.getAttribute('data-url');
            copyToClipboard(url, btn);
        });
    });
}

// 复制到剪贴板
function copyToClipboard(text, btn) {
    navigator.clipboard.writeText(text).then(() => {
        const originalText = btn.textContent;
        btn.textContent = '已复制';
        btn.style.backgroundColor = '#28a745';
        
        // 2秒后恢复
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.backgroundColor = '#007bff';
        }, 2000);
    }).catch(err => {
        console.error('复制失败:', err);
        btn.textContent = '复制失败';
        btn.style.backgroundColor = '#dc3545';
        
        // 2秒后恢复
        setTimeout(() => {
            btn.textContent = '复制';
            btn.style.backgroundColor = '#007bff';
        }, 2000);
    });
}

// 在滚动时更新焦点按钮
        function updateFocusedButtonOnScroll() {
            const copyButtons = document.querySelectorAll('.copy-btn');
            const installButtons = document.querySelectorAll('.download-button, .download-button-small');
            const allFocusableButtons = [...copyButtons, ...installButtons];
            
            if (allFocusableButtons.length === 0) return;
            
            // 检查当前焦点按钮是否可见
            const appList = document.getElementById('appList');
            const viewTop = appList.scrollTop;
            const viewBottom = viewTop + appList.clientHeight;
            
            let currentBtnVisible = false;
            if (focusedBtnIndex >= 0 && focusedBtnIndex < allFocusableButtons.length) {
                const currentBtn = allFocusableButtons[focusedBtnIndex];
                const rect = currentBtn.getBoundingClientRect();
                const btnTop = rect.top + appList.scrollTop;
                const btnBottom = btnTop + rect.height;
                currentBtnVisible = btnBottom >= viewTop && btnTop <= viewBottom;
            }
            
            // 如果当前焦点按钮不可见，则找到视口中的按钮并设置焦点
            if (!currentBtnVisible) {
                // 找到当前视口中所有可见按钮
                const visibleButtons = allFocusableButtons.filter(btn => {
                    const rect = btn.getBoundingClientRect();
                    const btnTop = rect.top + appList.scrollTop;
                    const btnBottom = btnTop + rect.height;
                    return btnBottom >= viewTop && btnTop <= viewBottom;
                });
                
                if (visibleButtons.length > 0) {
                    // 移除所有焦点
                    allFocusableButtons.forEach(btn => btn.classList.remove('focused'));
                    
                    // 设置焦点到第一个可见按钮
                    visibleButtons[0].classList.add('focused');
                    focusedBtnIndex = allFocusableButtons.indexOf(visibleButtons[0]);
                }
            }
        }

// 设置键盘导航
function setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        // 检查是否处于详情页面
        const detailSection = document.querySelector('.detail-section');
        const isDetailPage = detailSection !== null;
        
        // 检查是否有应用卡片（包括帮助卡片，现在都使用app-card类）
        const appCards = document.querySelectorAll('.app-card');
        const hasCards = appCards.length > 0;
        
        // 处理所有可聚焦按钮的键盘焦点：复制按钮和安装应用按钮
        const copyButtons = document.querySelectorAll('.copy-btn');
        const installButtons = document.querySelectorAll('.download-button, .download-button-small');
        const allFocusableButtons = [...copyButtons, ...installButtons];
        // 查找当前聚焦的按钮索引
        let foundFocusedBtn = false;
        allFocusableButtons.forEach((btn, index) => {
            if (btn.classList.contains('focused')) {
                focusedBtnIndex = index;
                foundFocusedBtn = true;
            }
        });
        // 如果没有找到聚焦的按钮，重置焦点索引
        if (!foundFocusedBtn) {
            focusedBtnIndex = -1;
        }
        
        // 获取分类导航项
        const categoryItems = document.querySelectorAll('.category-item');
        const currentCategoryIndex = categories.findIndex(c => c.id === currentCategory);
        
        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                if (isDetailPage) {
                    // 在详情页面，左箭头不用于按钮焦点移动，保留用于返回
                    clearDetail();
                } else if (focusArea === 'nav') {
                    // 焦点在导航栏，切换分类
                    navigateCategory(-1);
                } else if (hasCards) {
                    // 焦点在内容区域，向左切换应用
                    navigateApp('left');
                }
                break;
            case 'ArrowRight':
                e.preventDefault();
                if (isDetailPage) {
                    // 在详情页面，右箭头不用于按钮焦点移动，保留用于返回
                    clearDetail();
                } else if (focusArea === 'nav') {
                    // 焦点在导航栏，切换分类
                    navigateCategory(1);
                } else if (hasCards) {
                    // 焦点在内容区域，向右切换应用
                    navigateApp('right');
                }
                break;
            case 'ArrowUp':
                e.preventDefault();
                if (isDetailPage) {
                    const appList = document.getElementById('appList');
                    
                    if (allFocusableButtons.length > 0) {
                        if (focusedBtnIndex > 0) {
                            // 焦点在按钮上，向上移动焦点
                            allFocusableButtons[focusedBtnIndex].classList.remove('focused');
                            focusedBtnIndex--;
                            allFocusableButtons[focusedBtnIndex].classList.add('focused');
                            allFocusableButtons[focusedBtnIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
                        } else if (focusedBtnIndex === 0) {
                            // 焦点在第一个按钮，向上滚动
                            appList.scrollBy(0, -100);
                        } else {
                            // 没有焦点，设置焦点到第一个按钮
                            allFocusableButtons.forEach(btn => btn.classList.remove('focused'));
                            focusedBtnIndex = 0;
                            allFocusableButtons[focusedBtnIndex].classList.add('focused');
                            allFocusableButtons[focusedBtnIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    } else {
                        // 没有按钮，直接向上滚动
                        appList.scrollBy(0, -100);
                    }
                } else if (focusArea === 'content') {
                    const appList = document.getElementById('appList');
                    const appCards = document.querySelectorAll('.app-card');
                    
                    // 计算每行显示的卡片数量
                    const appGrid = document.querySelector('.app-grid');
                    let cols = 1;
                    if (appCards.length > 0 && appGrid) {
                        const cardMinWidth = 300;
                        const gap = 20;
                        const cardWidth = cardMinWidth + gap;
                        const gridWidth = appGrid.offsetWidth;
                        cols = Math.floor(gridWidth / cardWidth);
                        if (cols < 1) cols = 1;
                    }
                    
                    // 检查是否在第一行
                    if (focusIndex < cols || appList.scrollTop === 0) {
                        // 任意列向上结束，直接返回导航栏
                        focusArea = 'nav';
                        focusIndex = currentCategoryIndex;
                        updateFocus();
                    } else if (hasCards) {
                        // 焦点在内容区域，向上切换应用
                        navigateApp('up');
                    }
                }
                break;
            case 'ArrowDown':
                e.preventDefault();
                if (isDetailPage) {
                    const appList = document.getElementById('appList');
                    
                    if (allFocusableButtons.length > 0) {
                        if (focusedBtnIndex < allFocusableButtons.length - 1) {
                            // 焦点在按钮上，向下移动焦点
                            allFocusableButtons[focusedBtnIndex].classList.remove('focused');
                            focusedBtnIndex++;
                            allFocusableButtons[focusedBtnIndex].classList.add('focused');
                            allFocusableButtons[focusedBtnIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
                        } else if (focusedBtnIndex === allFocusableButtons.length - 1) {
                            // 焦点在最后一个按钮，向下滚动
                            appList.scrollBy(0, 100);
                        } else {
                            // 没有焦点，设置焦点到第一个按钮
                            allFocusableButtons.forEach(btn => btn.classList.remove('focused'));
                            focusedBtnIndex = 0;
                            allFocusableButtons[focusedBtnIndex].classList.add('focused');
                            allFocusableButtons[focusedBtnIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    } else {
                        // 没有按钮，直接向下滚动
                        appList.scrollBy(0, 100);
                    }
                } else if (focusArea === 'nav') {
                    // 焦点在导航栏，按下向下箭头，焦点切换到内容区域第一个卡片
                    focusArea = 'content';
                    focusIndex = 0;
                    updateFocus();
                } else if (hasCards) {
                    // 焦点在内容区域，向下切换应用
                    navigateApp('down');
                }
                break;
            case 'Enter':
                e.preventDefault();
                if (isDetailPage) {
                    if (allFocusableButtons.length > 0 && focusedBtnIndex >= 0) {
                        // 焦点在按钮上，触发点击事件
                        allFocusableButtons[focusedBtnIndex].click();
                    } else {
                        // 在详情页面，回车键返回列表
                        clearDetail();
                    }
                } else if (focusArea === 'nav') {
                    // 焦点在导航栏，按下确定键，焦点切换到内容区域第一个卡片
                    focusArea = 'content';
                    focusIndex = 0;
                    
                    // 确保DOM已经渲染完成，延迟执行updateFocus
                    setTimeout(() => {
                        updateFocus();
                    }, 10);
                } else {
                    // 焦点在内容区域，选择应用
                    selectApp();
                }
                break;
            case 'Escape':
                e.preventDefault();
                if (isDetailPage) {
                    // ESC键返回列表
                    clearDetail();
                } else if (focusArea === 'content') {
                    // 焦点从内容区域回到导航栏
                    focusArea = 'nav';
                    focusIndex = currentCategoryIndex;
                    updateFocus();
                }
                break;
        }
    });
}

// 导航分类
function navigateCategory(direction) {
    const currentIndex = categories.findIndex(c => c.id === currentCategory);
    let newIndex = currentIndex + direction;
    
    if (newIndex < 0) newIndex = categories.length - 1;
    if (newIndex >= categories.length) newIndex = 0;
    
    switchCategory(categories[newIndex].id);
}

// 导航应用或帮助
function navigateApp(direction) {
    if (currentCategory === 'help') {
        const appCards = document.querySelectorAll('.app-card');
        if (appCards.length === 0) return;
        
        // 移除当前焦点
        appCards[focusIndex]?.classList.remove('focused');
        
        // 计算新焦点
        switch (direction) {
            case 'left':
            case 'up':
                focusIndex--;
                break;
            case 'right':
            case 'down':
                focusIndex++;
                break;
        }
        
        // 确保焦点索引在有效范围内
        if (focusIndex < 0) focusIndex = 0;
        if (focusIndex >= appCards.length) focusIndex = appCards.length - 1;
        
        // 设置新焦点
        appCards[focusIndex]?.classList.add('focused');
        
        // 滚动到可见区域
        appCards[focusIndex]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
        const appCards = document.querySelectorAll('.app-card');
        if (appCards.length === 0) return;
        
        // 移除当前焦点
        appCards[focusIndex]?.classList.remove('focused');
        
        // 计算每行显示的卡片数量
        const appGrid = document.querySelector('.app-grid');
        let cols = 1;
        
        if (appCards.length > 0 && appGrid) {
            // 使用CSS中定义的minmax值（300px）作为卡片宽度，确保计算准确
            const cardMinWidth = 300; // 与CSS中的minmax(300px, 1fr)保持一致
            const gap = 20; // 与CSS中的gap保持一致
            const cardWidth = cardMinWidth + gap;
            const gridWidth = appGrid.offsetWidth;
            cols = Math.floor(gridWidth / cardWidth);
            if (cols < 1) cols = 1;
        }
        
        // 根据方向调整焦点索引
        switch (direction) {
            case 'left':
                focusIndex--;
                // 确保焦点不会移出当前行的左侧边界
                const currentRow = Math.floor(focusIndex / cols);
                focusIndex = Math.max(currentRow * cols, focusIndex);
                break;
            case 'right':
                focusIndex++;
                // 确保焦点不会移出当前行的右侧边界
                const currentRowRight = Math.floor(focusIndex / cols);
                focusIndex = Math.min((currentRowRight + 1) * cols - 1, focusIndex, appCards.length - 1);
                break;
            case 'up':
                // 检查是否在第一行，如果是，不修改焦点索引，让setupKeyboardNavigation处理返回导航栏
                if (focusIndex >= cols) {
                    focusIndex -= cols;
                }
                break;
            case 'down':
                // 检查是否在最后一行，如果是，不修改焦点索引
                const nextIndex = focusIndex + cols;
                if (nextIndex < appCards.length) {
                    focusIndex = nextIndex;
                }
                break;
        }
        
        // 确保焦点索引在有效范围内
        focusIndex = Math.max(0, focusIndex);
        focusIndex = Math.min(appCards.length - 1, focusIndex);
        
        // 设置新焦点
        appCards[focusIndex]?.classList.add('focused');
        
        // 滚动到可见区域
        appCards[focusIndex]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// 选择应用或帮助
function selectApp() {
    const appCards = document.querySelectorAll('.app-card');
    if (appCards.length === 0) return;
    
    const focusedCard = appCards[focusIndex];
    if (focusedCard) {
        focusedCard.click();
    }
}

// 更新焦点
function updateFocus() {
    // 移除所有可能的焦点
    document.querySelectorAll('.category-item, .app-card').forEach(item => {
        item.classList.remove('focused');
    });
    
    if (focusArea === 'nav') {
        // 更新导航栏焦点
        const categoryItems = document.querySelectorAll('.category-item');
        const currentIndex = categories.findIndex(c => c.id === currentCategory);
        categoryItems[currentIndex]?.classList.add('focused');
        categoryItems[currentIndex]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    } else if (focusArea === 'content') {
        // 更新内容区域焦点
        const appCards = document.querySelectorAll('.app-card');
        if (appCards.length === 0) return;
        
        if (focusIndex < appCards.length) {
            appCards[focusIndex].classList.add('focused');
            appCards[focusIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
    // 当focusArea为detail时，不需要执行任何操作，因为焦点由按钮焦点管理
}

// 清除应用详情，恢复列表视图
function clearDetail() {
    if (currentCategory === 'help') {
        renderHelpList();
    } else {
        renderAppList(currentCategory);
    }
    // 返回列表视图时，恢复之前保存的焦点状态
    focusArea = savedFocusState.focusArea;
    focusIndex = savedFocusState.focusIndex;
    updateFocus();
    currentApp = null;
    // 重置焦点按钮索引
    focusedBtnIndex = -1;
}

// 初始化页面
document.addEventListener('DOMContentLoaded', init);
