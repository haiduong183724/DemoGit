// Base xử lý liên quan tới grid
class BaseGrid {
    constructor(gridId){
        let me = this;

        // Lưu lại grid
        me.grid = $(gridId);

        // Lưu lại dữ liệu
        me.cacheData = [];

        // Form detail
        me.formDetail = null;

        // Lấy dữ liệu từ server
        me.getDataServer();

        // Khởi tạo các sự kiện
        me.initEvents();
    }

    // Khởi tạo form detail
    initFormDetail(formId){
        let me = this;
        
        // Khởi tạo form detail
        me.formDetail = new BaseForm(formId);
    }

    /**
     * Hàm dùng để khơi tạo các sự kiện trên trang
     * CreatedBy: NTXUAN 06.05.2021
     */
    initEvents(){
        let me = this,
            toolbarId = me.grid.attr("Toolbar"),
            toolbar = $(`#${toolbarId}`);

        // Khởi tạo các sự kiện cho toolbar
        if(toolbar){
            toolbar.find(".buttonItem").on("click", function(){
                let commandType = $(this).attr("CommandType"),
                    isClicked = CommonFn.fomatBool($(this).attr("click"));
                switch(commandType){
                    case Resource.CommandType.Add: // Thêm mới
                        if(isClicked){
                            me.add();
                        }
                        break;
                    case Resource.CommandType.Edit: // Sửa
                        if(isClicked){
                            me.edit();
                        }
                        break;
                    case Resource.CommandType.Delete: // Xóa
                        if(isClicked){
                            me.delete();
                        }
                        break;
                    case Resource.CommandType.Refresh: // Nạp
                        if(isClicked){
                            me.refresh();
                        }
                        break;
                    case Resource.CommandType.Import: // Nhập khẩu
                        if(isClicked){
                            me.import();
                        }
                        break;
                    case Resource.CommandType.Export: // Xuất khẩu
                        if(isClicked){
                            me.export();
                        }
                        break;
                }
            });
        }

        // Khởi tạo sự kiện select row
        me.initEventSelectMultiRowOnCtrl();
    }
    /**
     * Hàm Disable toolbar khi chưa có mục tiêu đc chọn
     * NHDUONG 12.5.2021
     */
    checkToolbar(){
        let me = this,
        toolbarId = me.grid.attr("Toolbar"),
        toolbar = $(`#${toolbarId}`);
        // kiểm tra có hàng nào được chọn chưa
        if(!$(".selectedRow").length){// chưa có
            if(toolbar){
                toolbar.find(".buttonItem").filter(function(){
                    let commandType = $(this).attr("CommandType");
                    // disable các nút sửa xóa.
                    switch(commandType){
                        case Resource.CommandType.Edit: // Sửa
                            $(this).attr('click','false' );
                            $(this).addClass("disable");
                            break;
                        case Resource.CommandType.Delete: // Xóa
                            $(this).attr('click','false');
                            $(this).addClass("disable");
                            break;
                    }
                });
                    
            }
        }
        else{//có
            if(toolbar){
                toolbar.find(".buttonItem").filter(function(){
                    let commandType = $(this).attr("CommandType");
                    // bỏ thuộc tính disable trên các nút sửa, xóa.
                    switch(commandType){
                        case Resource.CommandType.Edit: // Sửa
                            $(this).attr('click','true');
                            $(this).removeClass("disable");
                            break;
                        case Resource.CommandType.Delete: // Xóa
                            $(this).attr('click','true');
                            $(this).removeClass("disable");
                            break;
                    }
                });
                    
            }
        }
    }
    // /**
    //  * Khởi tạo sự kiện khi select dòng
    //  * NTXUAN 06.05.2021
    //  */
    // initEventSelectRow(mode){
    //     let me = this;
    //     // Khởi tạo sự kiện khi chọn các dòng khác nhau
    //     // Xóa các dòng đã được chọn
    //     me.grid.on("click", "tbody tr", function(){
    //         $(".selectedRow").filter(function(item){
    //            $(this).removeClass("selectedRow");
    //         });
    //         $(this).addClass("selectedRow");
    //     });
    // }

    /**
     * hàm khởi tạo sự kiện khi có một nút được nhấn xuống
     * 
     */
    //  handleKeyPress(){
    //     let me = this;
    //     $(document).keydown(function(event){
    //         switch (event.keyCode){
    //             case 17:
    //                 me.initEventSelectMultiRowOnCtrl(true);
    //             case 9:
    //                 me.trapTabKey(event);
    //         }
    //     });
    // }
/**
 * 
 * hàm xử lý tab trong form
 */

  

    // /**
    //  * Hàm khởi tạo sự kiện khi có một nút được nhả ra
    //  *  
    // */
    // handleKeyRelease(){
    //     let me = this;
    //     $(document).keyup(function(event){
    //         switch (event.keyCode){
    //             case 17:
    //                 me.initEventSelectMultiRowOnCtrl(false);
    //             case 9:
    //         }
    //     })
    // }
    /**
     * Khởi tạo sự kiên chọn nhiều dòng khi người dùng nhấn phím Ctrl
     * NHDUONG 12.5.2021
     */
    initEventSelectMultiRowOnCtrl(){
        let me = this,
            checkCtrl=false;
        // Bắt sự kiện nhấn phím Ctrl
        $(document).keydown(function(event){
            if(event.ctrlKey){
                checkCtrl = true;
                console.log(checkCtrl);
            } 
        });
        $(document).keyup(function(event){
            if(event.keyCode == 17) {
                checkCtrl = false;
                console.log(checkCtrl);
            }
        });
        me.grid.on("click", "tbody tr", function(){
            console.log(checkCtrl);
            if(!checkCtrl){
                $(".selectedRow").filter(function(item){
                    $(this).removeClass("selectedRow");
                 });
            }
            $(this).addClass("selectedRow");
            me.checkToolbar();
        });
    }
    /**
     * Hàm lấy dữ liệu từ server xong binding lên grid
     * CreatedBy: NTXUAN 06.05.2021
     */
    getDataServer(){
        let me = this,
            url = me.grid.attr("Url"),
            urlFull = `${Constant.UrlPrefix}${url}`;
        $("#loading").addClass("show");
        // Gọi ajax lấy dữ liệu trên server
        CommonFn.Ajax(urlFull, Resource.Method.Get, {}, function(response){
            if(response){
                
                me.cacheData = [...response];
                me.loadData(response);
                $("#loading").removeClass("show");
                me.checkToolbar();
            }else{
                $("#loading").removeClass("show");
                swal("Có lỗi khi lấy dữ liệu từ server");
            }
        });
        
        return me.cacheData;
    }

     /**
     * Hàm dùng để binding dữ liệu ra grid
     * CreatedBy: NTXUAN 06.05.2021
     */
    loadData(data){
        let me = this,
            table = $("<table></table>"),
            thead = me.renderThead(),
            tbody = me.renderTbody(data);
    
            table.append(thead);
            table.append(tbody);
    
        me.grid.find("table").remove();
        me.grid.append(table);

        // Làm một số thứ sau khi binding xong
        me.afterBinding();
    }

     /**
     * Hàm dùng để Render ra header của grid
     * CreatedBy: NTXUAN 06.05.2021
     */
    renderThead(){
        let me = this,
            thead = $("<thead></thead>"),
            row = $("<tr></tr>");
    
        // Duyệt toàn bộ các cột để lấy thông tin build header
        me.grid.find(".col").each(function(){
            let text = $(this).text(),
                th = $("<th></th>");
    
            th.text(text);
            row.append(th);
        });
    
        thead.append(row);
    
        return thead;
    }

     /**
     * Hàm dùng để Render ra nội dung grid
     * CreatedBy: NTXUAN 06.05.2021
     */
    renderTbody(data){
        let me = this,
            tbody = $("<tbody></tbody>");
    
        // Duyệt từng phần tử để build các row
        data.filter(function(item){
            let row = $("<tr></tr>");
    
            // Duyệt từng cột trên grid để lấy ra thông tin các cột
            me.grid.find(".col").each(function(){
                let column = $(this),
                    fieldName = column.attr("FieldName"),
                    dataType = column.attr("DataType"),
                    cell = $("<td></td>"),
                    valueCell = item[fieldName],
                    className = me.getClassFormat(dataType),
                    value = me.getValue(valueCell, dataType, column);
                    column.text("");
                cell.text(value);
                cell.addClass(className);
                row.append(cell);
            });

            // Lưu lại data để sau lấy ra dùng
            row.data("data", item);
    
            tbody.append(row);
        });
    
        return tbody;
    }

    /**
     * Hàm dùng để lấy value các cell dựa vào DataType
     * CreatedBy: NTXUAN 06.05.2021
     */
    getValue(data, dataType, column){

        switch(dataType){
            case Resource.DataTypeColumn.Number:
                data = CommonFn.formatMoney(data);
                break;
            case Resource.DataTypeColumn.Date:
                data = CommonFn.formatDate(data);
                break;
            case Resource.DataTypeColumn.Enum:
                let enumName = column.attr("EnumName");
                data = CommonFn.getValueEnum(data, enumName);
                break;
        }
    
        return data;
    }

     /**
     * Hàm dùng để lấy class format cho từng kiểu dữ liệu
     * CreatedBy: NTXUAN 06.05.2021
     */
    getClassFormat(dataType){
        let className = "";
    
        switch(dataType){
            case Resource.DataTypeColumn.Number:
                className = "align-right";
                break;
            case Resource.DataTypeColumn.Date:
                className = "align-center";
                break;
        }
    
        return className;
    }

    /**
     * Xử lý một số thứ sau khi binding xong
     * NTXUAN 06.05.2021
     */
    afterBinding(){
        let me = this;

        // Lấy Id để phân biệt các bản ghi
        me.ItemId = me.grid.attr("ItemId");

        // Mặc định chọn dòng đầu tiên
        // me.grid.find("tbody tr").eq(0).addClass("selectedRow");
    }

    /**
     * Lấy ra bản ghi đang được select
     * @returns 
     */
    getSelectedRecord(){
        let me = this,
            data = me.grid.find(".selectedRow").eq(0).data("data");

        return data;
    }

    /**
     * Hàm thêm mới
     * NTXUAN 06.05.2021
     */
    add(){
        let me = this,
            param = {
                Parent: this,
                FormMode: Enumeration.FormMode.Add,
                Record: {}
            };

        // Nếu có form detail thì show form
        if(me.formDetail){
            me.formDetail.open(param);
        }
    }

    /**
     * Hàm sửa
     * NTXUAN 06.05.2021
     */
    edit(){
        let me = this,
            param = {
                Parent: this,
                FormMode: Enumeration.FormMode.Edit,
                ItemId: me.ItemId,
                Record: {...me.getSelectedRecord()}
            };

        // Nếu có form detail thì show form
        if(me.formDetail){
            me.formDetail.open(param);
        }
    }

     /**
     * Hàm nạp mới dữ liệu
     * NTXUAN 06.05.2021
     */
    refresh(){
        let me = this;
        
        
        console.log(me.getDataServer());
        $(".selectedRow").filter(function(item){
            console.log("aaaa");
            $(this).removeClass("selectedRow");
         });
    }

     /**
     * Hàm xóa
     * NHDUONG 11.05.2021
     */
    delete(){
        let me = this,
            // lấy dữ liệu của đối tượng được chọn để xóa
            data = me.getSelectedRecord(),
            url =`${me.urlEdit}/${data.EmployeeId}`,
            method = Resource.Method.Delete,
            urlFull = `${Constant.UrlPrefix}${url}`;
            // gửi yêu cầu xóa dl
            CommonFn.Ajax(urlFull, method, data, function(response){
                if(response){
                    console.log("Cất dữ liệu thành công");
                    
                    // me.cancel();
                    me.getDataServer();
                }else{
                    console.log("Có lỗi khi cất dữ liệu");
                }
            });
    }

    /**
     * Hàm nhập khẩu
     * NTXUAN 06.05.2021
     */
    import(){

    }

    /**
     * Hàm xuất khẩu
     * NTXUAN 06.05.2021
     */
    export(){

    }
}
