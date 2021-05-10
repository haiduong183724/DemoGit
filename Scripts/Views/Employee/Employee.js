// Màn hình danh sách nhân viên
class EmpoyeePage extends BaseGrid {

    constructor(gridId){
       super(gridId);

       this.config();
    }

    // Cấu hình các url
    config(){
        let me = this,
            config = {
                urlAdd: "v1/Employees",
                urlEdit: "v1/Employees",
                urlDelete: "v1/Employees"
            };

        Object.assign(me, config);
    }

    // override: Khởi tạo form detail
    initFormDetail(formId){
        let me = this;
        
        // Khởi tạo form detail
        me.formDetail = new EmpoyeeDetail(formId);
    }
}

// Khởi tạo đối tượng màn hình danh sách nhân viên
let empoyeePage = new EmpoyeePage("#gridEmployee");

// Khởi tạo một form detail
empoyeePage.initFormDetail("#formEmployeeDetail");