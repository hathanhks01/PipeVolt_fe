import http from '../common/http-common';

const getAll = () => http.get('/PurchaseOrderDetails/GetList');
const getById = (id) => http.get(`/PurchaseOrderDetails/${id}`);
const create = (data) => http.post('/PurchaseOrderDetails', data);
const update = (id, data) => http.put(`/PurchaseOrderDetails/${id}`, data);
const remove = (id) => http.delete(`/PurchaseOrderDetails/${id}`);

const PurchaseOrderDetailService = {
  getAll,
  getById,
  create,
  update,
  remove,
};

export default PurchaseOrderDetailService;