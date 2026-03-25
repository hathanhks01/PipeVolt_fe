import http from '../common/http-common';

const getAll = () => http.get('/PurchaseOrders/GetList');
const getById = (id) => http.get(`/PurchaseOrders/${id}`);
const create = (data) => 
  http.post('PurchaseOrders/add-PurchaseOrders', data)
    .catch(err => { console.error('[PurchaseOrder] create failed:', err, '| payload:', data); throw err; });
const update = (id, data) => http.put(`/PurchaseOrders/${id}`, data);
const remove = (id) => http.delete(`/PurchaseOrders/${id}`);

const PurchaseOrderService = {
  getAll,
  getById,
  create,
  update,
  remove,
};

export default PurchaseOrderService;