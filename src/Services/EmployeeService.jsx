import http from '../common/http-common';

const EmployeeService = {
  // Tạo nhân viên mới
  createEmployee: async (employeeData) => {
    try {
      const response = await http.post('Employees', employeeData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating employee:', error);
      throw error;
    }
  },

  // Cập nhật nhân viên
  updateEmployee: async (id, employeeData) => {
    try {
      const response = await http.put(`Employees/${id}`, employeeData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating employee with ID ${id}:`, error);
      throw error;
    }
  },

  // Lấy tất cả nhân viên
  getAllEmployees: async () => {
    try {
      const response = await http.get('Employees/GetList');
      return response;
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }
  },

  // Lấy nhân viên theo ID
  getEmployeeById: async (id) => {
    try {
      const response = await http.get(`Employees/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching employee with ID ${id}:`, error);
      throw error;
    }
  },

  // Xóa nhân viên
  deleteEmployee: async (id) => {
    try {
      const response = await http.delete(`Employees/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting employee with ID ${id}:`, error);
      throw error;
    }
  }
};

export default EmployeeService;
