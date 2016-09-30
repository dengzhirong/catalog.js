/**
* 目录生成组件
*   options对象参数的属性如下：
        article [jQuery DOM] [必填]  文章容器
        menuWrap [jQuery DOM] [必填]  目录容器
        menu [jQuery DOM] [必填]  目录列表
        menuScrollListener(menuItemTop, menuItemIndex) [function]  [可选]  目录标题当前的top值。其中menuItemTop是当前高亮标题的top值，menuItemIndex是当前高亮标题的索引
    使用：
        window.util.catalog.init(options);
*/
window.util = window.util ? window.util : {};

window.util.catalog = {
    init: function(options) {
        new CatalogGenerator(options);
    }
};
function CatalogGenerator(options) {
    // 参数初始化
    var articleBodyEle  = options.article || $(document),
        menuWrap = options.menuWrap || options.menu,
        menuList = options.menu || menuWrap,
        menuScrollListener = options.menuScrollListener,
        articleHeader = articleBodyEle.find(":header");

    // 全局参数
    var headerTopArr = [], // 标题offset.top数组
        headerIdArr = [], // 标题id数组
        headerHtmlArr = [], // 标题文本数组
        headerTagName = [], // 标题标签类型数组
        menuHeaderArr = [], // 目录中标题的DOM数组
        isClickMenu = false; // 是否点击目录
    /**
    * 基础工具库
    */
    var baseUtil = {
        /**
         * 获取某一个值在数组中的范围
         * @param  {[int]} value [传入的要比较的值]
         * @param  {[array]} array [比较的数组]
         * @return {[int]}       [传入的值所在的区间的index]
         */
        getIndexInArr: function(value, array) {
            var returnIndex = 0;
            var arrayLength = array.length;
             array.forEach(function(element, index) {
                // 传入的值是否在某个区间范围内
                if(value >= element && value < array[index + 1]) {
                    returnIndex = index;
                } else if(value >= array[arrayLength - 1]) {
                    // 最后一个元素
                    returnIndex = arrayLength - 1;
                }
             });
             return returnIndex;
        }
    };

    /**
    * 目录属性构建
    */
    var catalogGeneratorUtil = {
        // 构建标题属性数组和目录列表
        initHeaderAttr: function() {
            articleHeader.each(function(index, element) {
                var curElementTagName = $(element).prop("tagName").toLowerCase();
                headerTopArr[index] = $(element).offset().top;
                headerHtmlArr[index] = $(element).text();
                headerTagName[index] = curElementTagName;
                var curElementId = curElementTagName +"_" + index;
                 headerIdArr[index] = curElementId;
                $(element).attr("id", curElementId);
                var curMenuHeaderAnchor = $("<a></a>").attr("href", "#" + curElementId).html(headerHtmlArr[index]);
                menuHeaderArr[index] = $("<li></li>").addClass("blog-catalogue-" + curElementTagName).append(curMenuHeaderAnchor);
            });
        },

        // 构建标题offset top数组
        initHeaderTopArr: function() {
            articleHeader.each(function(index, element) {
                headerTopArr[index] = $(element).offset().top;
            });
        },

        // 构建目录菜单
        initMenu: function() {
            menuList.append(menuHeaderArr);
            // console.log("headerTopArr: " + headerTopArr);
            // console.log("headerIdArr: " + headerIdArr);
            // console.log("menuHeaderArr: " + menuHeaderArr.toString());
        }
    };

    /**
    * 目录滚动事件监听
    */
    var scrollHandlerUtil = {
        // 浏览器滚动监听：长目录滚动定位、目录高亮
        scrollHandler: function() {
            var curSectionIndex = 0,
                listenLongMenuTimer = null,
                _this = this;

            // 目录初始化高亮
            _this._highLightArticleMenu(curSectionIndex);

            // 浏览器滚动事件监听
            $(window).scroll(function() {
                var winScrollTop = $(this).scrollTop();
                if(!isClickMenu) {
                    curSectionIndex = baseUtil.getIndexInArr(winScrollTop, headerTopArr);
                    _this._highLightArticleMenu(curSectionIndex);

                    // 长目录定位
                    if(listenLongMenuTimer) {
                        clearTimeout(listenLongMenuTimer);
                        listenLongMenuTimer = null;
                    }
                    var curHighLightMenuItem = menuList.find("li").eq(curSectionIndex);
                    if(curHighLightMenuItem.length > 0) {
                        var articleMenuGcHeight = menuWrap.height(),
                            curHighLightMenuItemTop = 0,
                            menuScrollTop = 0;
                            curHighLightMenuItemTop = $(curHighLightMenuItem).offset().top - menuWrap.offset().top + menuWrap.scrollTop();
                        if(curHighLightMenuItemTop >= articleMenuGcHeight) {
                            menuScrollTop = curHighLightMenuItemTop - articleMenuGcHeight + 40;
                            menuWrap.stop().animate({scrollTop: curHighLightMenuItemTop - articleMenuGcHeight + 40}, 0);
                        } else {
                            menuScrollTop = 0;
                            menuWrap.stop().animate({scrollTop: 0}, 0);
                        }
                        menuWrap.stop().animate({scrollTop: menuScrollTop}, 0);
                        if(typeof menuScrollListener == "function") {
                            menuScrollListener(curHighLightMenuItemTop, curSectionIndex);
                        }
                    }

                }
            });

            // 长目录滚动时，禁止文档跟随滚动
            console.log("menuList.height(): " + menuList.height() + "; \n " + "menuWrap.height: " + menuWrap.height());
            if(menuList[0] && menuWrap[0] && menuList.height() > menuWrap.height()) {
                menuList[0].addEventListener("mousewheel", function(event) {
                    preventMouseWheel(menuWrap[0], event);
                }, false);
                if (document.mozHidden !== undefined) {
                    menuList[0].addEventListener("DOMMouseScroll", function(event) {
                        preventMouseWheel(menuWrap[0], event);
                    }, false);
                }
            }

            // 鼠标在thisEle元素上时，禁止文档跟随滚动
            function preventMouseWheel(thisEle, event) {
                var scrollTop = thisEle.scrollTop,
                    scrollHeight = thisEle.scrollHeight,
                    height = thisEle.clientHeight;

                var delta = (event.wheelDelta) ? event.wheelDelta : -(event.detail || 0);

                if ((delta > 0 && scrollTop <= delta) || (delta < 0 && scrollHeight - height - scrollTop <= -1 * delta)) {
                    // IE浏览器下滚动会跨越边界直接影响父级滚动，因此，临界时候手动边界滚动定位
                    thisEle.scrollTop = delta > 0 ? 0: scrollHeight;
                    // 向上滚 || 向下滚
                    event.preventDefault();
                }
            }
        },

        /**
        * 目录标题添加active样式
        * @param  {[int]} headerIndex  [目录标题的索引]
        */
        _highLightArticleMenu: function(headerIndex) {
            var curHighLightMenuItem = menuList.find("li").eq(headerIndex);
            $(curHighLightMenuItem).addClass("active").siblings('li').removeClass('active');
        },

        // 目录标题的点击事件绑定
        menuItemClickHandler: function() {
            var _this = this;
            menuList.delegate("li", "click", function(e) {
                e.preventDefault();
                e.stopPropagation();
                isClickMenu = true;
                var curIndex = $(this).index(),
                    thisEle = $(this);
                _this._highLightArticleMenu(curIndex);
                $("html, body").animate({"scrollTop": headerTopArr[curIndex]}, 300);
                if(typeof menuScrollListener == "function") {
                    var menuItemTop = thisEle.offset().top - menuWrap.offset().top + menuWrap.scrollTop();
                    menuScrollListener(menuItemTop, curIndex);
                }
                setTimeout(function() {
                    isClickMenu = false;
                }, 400);
            });
        }
    };

    // 文章标题 offset top 数组定时更新
    this.updateHeaderTopArr = function() {
        var timer = null,
            count = 0;
        timer = setTimeout(function() {
            if(count <= 10) {
                catalogGeneratorUtil.initHeaderTopArr();
                count++;
            } else {
                if(timer) {
                    clearTimeout(timer);
                    timer = null;
                }
            }
        }, 500);
    };

    this.updateHeaderTopArr();

    // 初始化
    this.init = function() {
        catalogGeneratorUtil.initHeaderAttr(); // 构建标题属性数组和目录列表
        catalogGeneratorUtil.initMenu(); // 构建目录菜单

        scrollHandlerUtil.menuItemClickHandler(); // 目录标题的点击事件绑定
        scrollHandlerUtil.scrollHandler(); // 浏览器滚动监听：长目录滚动定位、目录高亮
    };
    this.init();
}