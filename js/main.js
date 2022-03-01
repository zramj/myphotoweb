$(function(){
    $('#gallery').each(function (){
        //#gallery 元素為圖庫內容之容器
        var $container = $(this),
            $loadMoreBubbon = $('#load-more'), //附加按鈕
            $filter = $('#gallery-filter'), //篩選表單
            addItemConut = 16, //一次顯示的項目數量
            added = 0, //顯示結束的項目數量
            allData = [],  //完整的 Json 資料
            filteredData = [];  //篩選後的 Json
        
        //設定 Ｍasonry 選項
        $container.masonry({
            columnWidth: 230,
            gutter: 20,
            itemSelector: '.gallery-item'
        });

        // jQuery UI Button
        // $('.filter-form input[type="radio"]').button({
        //     icons: {
        //         primary: 'icon-radio'
        //     }
        // });
        

        // 取得Json 並執行 initGallery 函式
        $.getJSON('./data/content.json', initGallery);

        //圖庫初始化
        function initGallery (data) {
            allData = data; //儲存取得得Json的資料
            filteredData = allData; //初始狀態不做任何篩選
            addItems(); //顯示初始的項目資料
            $loadMoreBubbon.on('click', addItems); //點擊 Load-more 後顯示
            $filter.on('change', 'input[type="radio"]', filterItems); //篩選的 radio button 有變化的話則執行篩選
            
            //針對項目的連結註冊 hover 效果
            $container.on('mouseenter mouseleave', ".gallery-item a", hoverDirecton);
        }

        //建立項目並插入文件
        function addItems (filter) {
            var elements = [],
                //新增資料的陣列
                slicedData = filteredData.slice(added, added + addItemConut);
            //對每個 slicedData 的元素建立 Dom 元素
            $.each(slicedData, function(i, item){
                var itemHTML = 
                    '<li class="gallery-item is-loading">' +
                        '<a href="' + item.images.large + '">' +
                            '<img src="' + item.images.thumb + '" alt="" >' +
                            '<span class="caption">' +
                                '<span class="inner">' +
                                    '<b class="title">' + item.title + '</b>' +
                                    '<time class="data" datatime="' + item.data + '">' + item.date.replace(/-0?/g, '/')+
                                    '</time>' +
                                '</span>' +
                            '</span>'+
                        '</a>'+
                    '</li>';
                elements.push($(itemHTML).get(0));
            });
             
            //將 Dom 元素陣列插入 container, 並執行 Masonry 配置
            $container
                .append(elements)
                .imagesLoaded(function(){
                    $(elements).removeClass('is-loading');
                    $container.masonry('appended', elements);

                    //篩選後重新配置
                    if(filter) {
                        $container.masonry();
                    }
                });

            //設定 lightbox
            $container.find('a').colorbox({
                maxWidth: '970px',
                maxHeight: '95%',
                title: function(){
                    return $(this).find('.inner').html();
                }
            });        

            //新增結束後更新項目數目
            added += slicedData.length;
            
            //當 Json 中的資料皆已經顯示時, 隱藏 load-more 按鈕
            if (added < filteredData.length){
                $loadMoreBubbon.show();
            } else {
                $loadMoreBubbon.hide();
            }

        }

        //項目篩選
        function filterItems () {
            var key =  $(this).val(), //點選的 Radio Button 狀態值
                //新增後的 Masonry 項目
                masonryItem = $container.masonry('getItemElements');
            
            //刪除 Masonry 項目
            $container.masonry('remove', masonryItem);

            //重新設定篩選後的項目資料
            //與加入的項目資料數
            filteredData = [];
            added = 0;

            if (key === 'all'){
                //all如果是點選 all, 則儲存所有的Json資料
                filteredData = allData;
            } else {
                //all以外的情況, 則取出符合鍵值的資料
                filteredData = $.grep(allData, function (item) {
                    return item.category === key;
                });
            }

            //加入項目
            addItems(true);
        }
        
        //建立滑鼠移入移出效果
        function hoverDirecton(event) {
            var $overlay =  $(this).find('.caption'),
                side  = getMouseDirection(event),
                animateTo,
                positionIn = {
                    top: '0%',
                    left: '0%'
                },
                positionOut = (function (){
                    switch (side) {
                        // case 0: top, case 1: right, case 2: bottom, default: left
                        case 0:  return { top: '-100%', left:    '0%' }; break; // top
                        case 1:  return { top:    '0%', left:  '100%' }; break; // right
                        case 2:  return { top:  '100%', left:    '0%' }; break; // bottom
                        default: return { top:    '0%', left: '-100%' }; break; // left
                    }
                })();
            if (event.type === 'mouseenter'){
                animateTo = positionIn;
                $overlay.css(positionOut);
            } else {
                animateTo = positionOut;
            }
            $overlay.stop(true).animate(animateTo,250, 'easeOutExpo');
        };

        //偵測滑鼠方向
        function getMouseDirection(event){
            var $el= $(event.currentTarget),
                offset = $el.offset(),
                w = $el.outerWidth(),
                h = $el.outerHeight(),
                x = (event.pageX - offset.left - w / 2) * (( w > h )? h / w: 1),
                y = (event.pageY - offset.top - h / 2) * (( h > w )? w / h: 1),
                direction = Math.round((Math.atan2(y, x) * (180 / Math.PI) + 180) / 90  + 3) % 4;
            return direction;
        }
    });

    // Resize page header
    $('.page-header').each(function () {
        var $header = $(this),
            headerHeight = $header.outerHeight(),
            headerPaddingTop = parseInt($header.css('paddingTop'), 10),
            headerPaddingBottom = parseInt($header.css('paddingBottom'), 10);
        $(window).on('scroll', $.throttle(1000 / 60, function () {
            var scroll = $(this).scrollTop(),
                styles = {};
            if (scroll > 0) {
                if (scroll < headerHeight) {
                    styles = {
                        paddingTop: headerPaddingTop - scroll / 2,
                        paddingBottom: headerPaddingBottom - scroll / 2
                    };
                } else {
                    styles = {
                        paddingTop: 0,
                        paddingBottom: 0
                    };
                }
            } else {
                styles = {
                    paddingTop: '',
                    paddingBottom: ''
                }
            }
            $header.css(styles);
        }));
    }); 


});      

//請求 Json 檔案 - 基礎版
        // $.getJSON('./data/content.json', function(data) {
            
            //用以儲存迴圈生成的 DOM 元素陣列
            // var elements = [];

            //對 Json 陣列(data) 的每個元素(item)執行迴圈處理
            // $.each(data, function(i, item){
            //     var itemHTML = 
            //         '<li class="gallery-item is-loading">'+
            //             '<a href="'+ item.images.large + '">' +
            //                 '<img src="' + item.images.thumb + 
            //                 '" alt="'+ item.title + '">' +
            //             '</a>' +
            //         '</li>';
                //將 HTML 字串元素化並加到陣列中
                // elements.push($(itemHTML).get(0));
            // });

            // 插入 DOM
            // $container.append(elements);

            //圖片載入結束後使用 Masonry 進行配置
    //         $container.imagesLoaded(function(){
    //             $(elements).removeClass('is-loading');
    //             $container.masonry('appended',elements);
    //         });
    //     });