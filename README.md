Test Firestore Transactions
===

Tài liệu về Firestore transactions: https://firebase.google.com/docs/firestore/manage-data/transactions

Mình thử deploy 1 function với mục đích:

- lấy thông tin balance hiện tại
- random operator là + (cộng) hoặc - (trừ) 1 số ngẫu nhiên với balance hiện tại
- lưu balance mới vào profile
- tạo 1 record transactionHistory
- Thao tác `update balance` & `create transactionHistory` phải đồng thời `success` hoặc đồng thời `fail`

## Deploy functions

```bash
firebase deploy --only functions
```

## Test

Gọi từ localhost file `worker.js`, file này có các thông số:
- endpoint: lấy từ environment, là endpoint từ Firebase functions
- totalCall: tổng số lượt request lên api
- concurrency: số request gọi đồng thời

```bash
node worker.js
```

## Result

**Lần 1**

totalCall = 180000, concurrency = 3000

```json
{
  "successCount": 175929,
  "errCount": 4071
}
```

**Lần 2**

totalCall = 180000, concurrency = 3000

```json
{
  "successCount": 176411,
  "errCount": 3589
}
```

Tổng 2 lần gọi `360000` requests chỉ có `554` TX được ghi.

*Giảm concurrency request thêm 2 lần nữa*

**Lần 3**

totalCall = 60000, concurrency = 1000

```json
{
  "successCount": 59987,
  "errCount": 13
}
```

**Lần 4**

totalCall = 60000, concurrency = 1000

```json
{
  "successCount": 59986,
  "errCount": 14
}
```

Tổng 2 lần gọi `120000` requests chỉ có `241` TX được ghi.

## Tổng kết

- Số lượng instance & request handle trong Firebase Functions HTTP có thể scale gần như [vô hạn](https://firebase.google.com/docs/functions/quotas)
- Mặc dù handle được rất nhiều request nhưng số lượng TX tạo ra cực kì nhỏ, nguyên nhân có thể do request từ 1 client lên và instance bị timeout (sẽ tìm hiểu nguyên nhân sâu hơn ở phần sau)

![](https://i.imgur.com/hqmpvV8.png)

## Thống kê

Instance specs

```
Region us-central1
Memory allocated 256 MB
Timeout 60 seconds
```

![](https://i.imgur.com/dX85ZnD.png)

![](https://i.imgur.com/gL3I3pk.png)

![](https://i.imgur.com/TLKIgnf.png)
