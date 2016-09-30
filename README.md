文章目录生成组件。（jQuery版）

options对象参数的属性如下：

>- **article** [jQuery DOM] [必填]  文章容器
>- **menuWrap** [jQuery DOM] [必填]  目录容器
>- **menu** [jQuery DOM] [必填]  目录列表
>- **menuScrollListener(menuItemTop, menuItemIndex)** [function]  [可选]  目录标题当前的top值。其中menuItemTop是当前高亮标题的top值，menuItemIndex是当前高亮标题的索引


## 使用：

```
window.util.catalog.init(options);
```

## 演示地址：


