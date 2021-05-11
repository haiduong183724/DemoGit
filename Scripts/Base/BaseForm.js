class BaseForm{
    constructor(formId){
        let me = this;

        // Lưu lại đối tượng form
        me.form = $(formId);
        me.formMode = null;

        // Khởi tạo các sự kiện form
        me.initEvents();

    }

    // Khởi tạo các sự kiện form
    initEvents(){
       let me = this;

       // Khởi tạo các sự kiện click button
       me.initButtonClick();
    }

    // Khởi tạo các sự kiện click button form
    initButtonClick(){
        let me = this;

        // Khởi tạo các sự kiện button trên form
        me.form.find(".btnForm").on("click", function(){
            let command = $(this).attr("Command");

            switch(command){
                case Resource.CommandForm.Save:  // Lưu
                    me.save(true);
                    break;
                case Resource.CommandForm.Cancel:  // Hủy
                    me.cancel(false);
                    break;
            }
        });
    }

    // Mở form detail
    open(param){
        let me = this;

        // Gán các thuộc tính param vào me
        Object.assign(me, param);

        // Hiển thị form và reset
        me.show();

        // Kiểm tra xem có phải mode sửa không
        if(me.FormMode == Enumeration.FormMode.Edit){
            me.bindingData(me.Record);
        }
    }

    // Binding dữ liệu form
    bindingData(data){
        let me = this;

        // Duyệt từng control để binding dữ liệu
        me.form.find("[FieldName]").each(function(){
            let fieldName = $(this).attr("FieldName"),
                dataType = $(this).attr("DataType"),
                value = data[fieldName],
                control = $(this);

            me.setValueControl(control, value , dataType);
        });
    }

    // Set giá trị cho control
    setValueControl(control, value , dataType){
        let me = this;

        switch(dataType){
            case Resource.DataTypeColumn.Date:
                value = CommonFn.convertDate(value);
                break;
        }

        control.val(value);
    }

    // Mở form
    show(){
        let me = this;

        me.form.show();

        // reset dữ liệu
        me.resetForm();
    }

    // reset form
    resetForm(){
        let me = this;

        // Gán giá trị rỗng
        me.form.find("[FieldName]").val("");
        me.form.find(".notValidControl").removeClass("notValidControl");
    }

    // Lưu dữ liệu form
    save(){
        let me = this,
            isValid = me.validateForm();
        // Kiểm tra validate form
        if(isValid){
            let data = me.getDataForm();

            me.saveData(data);
        }
    }

    // Lưu dữ liệu 
    saveData(data){
        let me = this,
            url = me.Parent.urlAdd,
            method = Resource.Method.Post,
            urlFull = `${Constant.UrlPrefix}${url}`;
        // Nếu edit thì sửa lại
        if(me.FormMode == Enumeration.FormMode.Edit){
            url = `${me.Parent.urlEdit}/${data[me.ItemId]}`;
            method = Resource.Method.Put;
            urlFull = `${Constant.UrlPrefix}${url}`;
        }
        // Gọi lên server cất dữ liệu
        CommonFn.Ajax(urlFull, method, data, function(response){
            if(response){
                console.log("Cất dữ liệu thành công");

                me.cancel();
                me.Parent.getDataServer();
            }else{
                console.log("Có lỗi khi cất dữ liệu");
            }
        });
    }

    // Lấy dữ liệu form
    getDataForm(){
        let me = this,
            data = me.Record || {};

        me.form.find("[FieldName]").each(function(){
            let control = $(this),
                dataType = control.attr("DataType"),
                fieldName = control.attr("FieldName"),
                value = me.getValueControl(control, dataType);

            data[fieldName] = value;
        });

        return data;
    }

    // Lấy dữ liệu form dựa vào dataType
    getValueControl(control, dataType){
        let me = this,
            value = control.val();

        switch(dataType){
            case Resource.DataTypeColumn.Date:
                value = new Date(value);
                break;
            case Resource.DataTypeColumn.Number:
                value = parseInt(value);
                break;
            case Resource.DataTypeColumn.Enum:
                value = parseInt(value);
                break;
        }

        return value;
    }

    // Validate form 
    validateForm(){
        let me = this,
            isValid = me.validateRequire(); // Validate các trường bắt buộc nhập

        if(isValid){
            isValid = me.validateFieldNumber(); // Validate các trường nhập  số
        }

        if(isValid){
            isValid = me.validateFieldDate(); // Validate các trường ngày tháng
        }

        if(isValid){
            isValid = me.validateCustom(); // Validate các trường hợp đặc biệt khác
        }

        return isValid;
    }

    // Validate các trường bắt buộc
    validateRequire(){
        let me = this,
            isValid = true;

        // Duyệt hết các trường require xem có trường nào bắt buộc mà ko có value ko
        me.form.find("[Require='true']").each(function(){
            let value = $(this).val();

            if(!value){
                isValid = false;

                $(this).addClass("notValidControl");
                $(this).attr("title", "Vui lòng không được để trống!");
            }else{
                $(this).removeClass("notValidControl");
            }
        });

        return isValid;
    }

    // Validate các trường Number
    validateFieldNumber(){
        let me = this,
            isValid = true;

        // Duyệt hết các trường require xem có trường nào bắt buộc mà ko có value ko
        me.form.find("[DataType='Number']").each(function(){
            let value = $(this).val();

            // is not a number
            if(isNaN(value)){
                isValid = false;

                $(this).addClass("notValidControl");
                $(this).attr("title", "Vui lòng nhập đúng định dạng!");
            }else{
                $(this).removeClass("notValidControl");
            }
        });

        return isValid;
    }

    // Validate các trường ngày tháng
    validateFieldDate(){
        let me = this,
            isValid = true;

        // Duyệt hết các trường require xem có trường nào bắt buộc mà ko có value ko
        me.form.find("[DataType='Date']").each(function(){
            let value = $(this).val();

            // is not a number
            if(!CommonFn.isDateFormat(value)){
                isValid = false;

                $(this).addClass("notValidControl");
                $(this).attr("title", "Vui lòng nhập đúng định dạng!");
            }else{
                $(this).removeClass("notValidControl");
            }
        });

        return isValid;
    }
    // Hàm dùng cho các màn override lại: validate Trùng mã nhân viên hoặc các kiểu validate khác
    validateCustom(){
        let me = this,
            data = me.getDataForm(),
            isValid = me.validateEmployeeId(); // Validate các trường bắt buộc nhập

        if(isValid){
            isValid = me.validateEmail(data); // Validate các trường nhập  số
        }

        if(isValid){
            isValid = me.validatePhone(data); // Validate các trường ngày tháng
        }
        return isValid;
    }
    // hàm validate mã nhân viên
    validateEmployeeId(){
        let me = this,
            data = me.getDataForm(),
            dataFix = me.Parent.getSelectedRecord(),
            dataCache = me.Parent.getDataServer();

        for( var i = 0; i< dataCache.length; i++){
            if(data.EmployeeCode == dataCache[i].EmployeeCode && dataCache[i].EmployeeCode !=  dataFix.EmployeeCode){
                me.form.find("[FieldName='EmployeeCode']").each(function(){
                    $(this).addClass("notValidControl");
                    $(this).attr("title", "Mã nhân viên đã tồn tại, vui lòng nhập mã khác!");
                });
                return false;
            }
        }
        $(this).removeClass("notValidControl");
        return true;
    }
    //hàm validate số điện thoại
    validatePhone(data){
        let me =this,
            filter = /\d{1}/g,
            phone = data.PhoneNumber,
            listNumber = phone.match(filter);
        if(phone.length == 0){
            return true;
        }
        if(listNumber.length != 10 || listNumber.length != phone.length){
            me.form.find("[FieldName='PhoneNumber']").each(function(){
                $(this).addClass("notValidControl");
                $(this).attr("title", "Số điện thoại không hợp lệ");
            });
            return false;
        }
        $(this).removeClass("notValidControl");
        return true;
    }
    // hàm kiểm tra email
    validateEmail(data){
        let me =this,
            filter = /^[a-z][a-z0-9_\.]{5,32}@[a-z0-9]{2,}(\.[a-z0-9]{2,4}){1,2}$/g,
            email = data.Email;
        if(email.length==0){
            return true;
        }
        if(!filter.test(email) && email.length != 0){
            me.form.find("[FieldName='Email']").each(function(){
                $(this).addClass("notValidControl");
                $(this).attr("title", "Email không hợp lệ");
            });
            return false;
        }
        $(this).removeClass("notValidControl");
        return true;
    }
    // Hủy sự kiện đóng form
    cancel(state = true){
        let me = this;
        me.form.hide();
        if(state){
            if(me.FormMode == Enumeration.FormMode.Edit){
                swal("Chỉnh sửa thành công", {
                    timer:2000,
                });
            }
            else{
                swal("Đã thêm thành công !",{
                    timer:2000,
                });
            }
        }
    }
}