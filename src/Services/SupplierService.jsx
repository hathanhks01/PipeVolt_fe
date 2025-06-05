import http from '../common/http-common';

const getAll = () => http.get('/Suppliers/GetList');
const getById = (id) => http.get(`/Suppliers/${id}`);
const create = (data) => http.post('/Suppliers', data);
const update = (id, data) => http.put(`/Suppliers/${id}`, data);
const remove = (id) => http.delete(`/Suppliers/${id}`);

const SupplierService = {
  getAll,
  getById,
  create,
  update,
  remove,
};

export default SupplierService;