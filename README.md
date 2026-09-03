# Canva хэвлэлийн үйлчилгээ — zuvhuntuund.com-д нэмэх заавар

## Файлууд
- `order.html` — захиалгын бүрэн хуудас (бүтээгдэхүүн сонголт → үнэ тооцоолол → Canva линк → QPay). CSS/JS бүгд дотор нь тул шууд байршуулж болно.
- `admin.html` — захиалгуудын жагсаалт, Canva линк рүү шууд орох, "линк шалгасан" / "хэвлэсэн" статус тэмдэглэх самбар. Нэвтрэхэд ADMIN_KEY-ээр хамгаалагдсан (доор тайлбарласан).
- `netlify/functions/create-print-order.js` — захиалга үүсгэж, Canva линк + захиалгын мэдээллийг Netlify Blobs-д хадгалж, QPay нэхэмжлэх үүсгэдэг.
- `netlify/functions/qpay-status.js` — төлбөрийн статус шалгаж, төлөгдмөгц баталгаажуулах имэйл явуулдаг.
- `netlify/functions/list-print-orders.js` — admin.html-д зориулж бүх захиалгыг буцаадаг.
- `netlify/functions/update-print-order.js` — admin.html-ээс "линк шалгасан"/"хэвлэсэн" гэх мэт статус өөрчлөлтийг хадгалдаг.

## Admin нэвтрэлт
`admin.html` нь маш энгийн нууц үгээр хамгаалагдсан (MVP зориулалттай, magic-link биш): Netlify env variable-т **ADMIN_KEY**-г тохируулаад, admin.html руу орохдоо яг тэр нууц үгийг оруулна. Хэрэв zt-site дээр аль хэдийн admin dashboard-ын жинхэнэ нэвтрэлт (magic link auth) байгаа бол үүнийг сольж, `x-admin-key` header шалгах хэсгийг өөрийн auth middleware-аар солиорой.

## Файл upload биш, Canva линк
Хэрэглэгч дизайнаа экспортлож upload хийхийн оронд Canva-гийн **Share** линкээ буулгана (`https://www.canva.com/design/...`, "Anyone with the link can view" тохиргоотой). Энэ нь:
- Файлын хэмжээ/formatын асуудлаас бүрэн ангижруулна (upload-той холбоотой бүх payload-хязгаарлалт арилна).
- Гэхдээ **захиалга бүрийг хэвлэхээс өмнө линкийг нээж шалгах ёстой** — линк хаалттай/устсан байх, эсвэл download зөвшөөрөгдөөгүй байх эрсдэлтэй. `linkChecked: false` талбарыг order metadata-д нэмсэн — admin хуудаснаас шалгасны дараа `true` болгож тэмдэглэх боломжтой.

## Нэгтгэх алхмууд (zt-site repo-д)
1. `order.html`-г `/canva-print/` эсвэл ямар URL дор байршуулахаа шийдээд, sitenav/menu-д холбоос нэмнэ.
2. Хоёр function-ийг `netlify/functions/` дотор байгаа одоогийн functions-тэй хамт байрлуул.
3. **QPay**: та аль хэдийн QPay интеграцитай тул, шинээр бичсэн `getQpayToken`/`createQpayInvoice`-г ашиглахын оронд одоо байгаа helper-ээ дуудаж болно. Хэрэв шинэ invoice-той (энэ үйлчилгээнд зориулсан тусдаа QPay invoice code) ажиллуулах бол `QPAY_INVOICE_CODE`-г Netlify env variable-т нэмээрэй.
4. **Env variables шаардлагатай**: `QPAY_USERNAME`, `QPAY_PASSWORD`, `QPAY_INVOICE_CODE`, `RESEND_API_KEY` (аль хэдийн байгаа байх), мөн шинээр **`ADMIN_KEY`** (admin.html-ийн нэвтрэлтэд).
5. **Netlify Blobs**: `print-orders-files` болон `print-orders-meta` гэсэн 2 шинэ store үүснэ — одоогийн `zt-data` store-той зөрчилдөхгүй.
6. Захиалгуудыг харах admin хуудас `admin.html` — жагсаалт, шүүлтүүр, Canva линк рүү орох, "линк шалгасан"/"хэвлэсэн" статус тэмдэглэх боломжтой. `list-print-orders.js`, `update-print-order.js` хоёр function-ийг бусад functions-тэй хамт байрлуулаарай.

## Мэдэгдэж буй хязгаарлалт
- Canva линк зөвхөн "view" эрхтэй тохиолдолд таны тал экспортлож татаж авах шаардлагатай — Canva Pro биш хэрэглэгчийн зарим фонт/элемент export дээр солигдож болзошгүй тул хэвлэхээс өмнө нэг удаа нүдээр шалгах нь зүйтэй.
- Үнийн дүн (`PRICING` object, `order.html`-ийн эхэнд) бол жишээ тоо — өөрийн бодит зардалдаа тааруулж засаарай.
- Стикерийн "тусгай хэлбэр" захиалгыг та Silhouette Studio дээр гараар боловсруулна гэдгийг тооцож, автомат урсгалд оруулаагүй болно.
