/* ============================================================
   Зөвхөн түүнд — JSONBin -> Netlify Blobs шилжилтийн Function
   (ӨГӨГДӨЛ ШУУД ЭНД ШИНГЭЭГДСЭН — JSONBin API 403 quota алдаатай
   тул хэрэглэгчийн өгсөн JSONBin export-ийг шууд энд байрлуулсан.)

   ХЭРХЭН АШИГЛАХ:
   Browser дээр нэг удаа дараах URL руу орно:
   https://таны-сайт.netlify.app/.netlify/functions/migrate?pin=ТАНЫ_ADMIN_PIN

   "ok: true, migrated: {...}" гэсэн хариу ирвэл амжилттай. Дараа нь энэ
   файлыг GitHub-аас устгаж болно (цаашид хэрэггүй).
   ============================================================ */

const { getStore } = require("@netlify/blobs");

function storeConfig(name){
  const siteID = process.env.NETLIFY_SITE_ID;
  const token = process.env.NETLIFY_BLOBS_TOKEN;
  if(siteID && token){
    return { name, siteID, token };
  }
  return name;
}

function json(status, body){
  return {
    statusCode: status,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  };
}

function checkPin(pin){
  const real = process.env.ADMIN_PIN;
  return typeof real === "string" && real.length > 0 && pin === real;
}

const MAIN_DOC = {
  "orders": [
    {
      "id": "e60968fb-b530-4030-86ef-fe19723a8c43",
      "orderNumber": "ZT495545",
      "createdAt": "2026-06-25T07:11:56.411Z",
      "customerName": "Энхжин",
      "customerPhone": "90081808",
      "recipientKey": "partner",
      "recipient": "Хайртдаа",
      "container": {
        "id": 426839,
        "name": "Бэлгийн хайрцаг",
        "price": 6000
      },
      "items": [
        {
          "id": 896651,
          "name": "Ягаан мини сарнайтай баглаа",
          "price": 54000
        },
        {
          "id": 776019,
          "name": "Love аяга",
          "price": 33000
        },
        {
          "id": 429144,
          "name": "Зүрхэн шилтэй лаа",
          "price": 8000
        }
      ],
      "message": "хайртай шүү",
      "subtotal": 101000,
      "deliveryFee": 7000,
      "total": 108000,
      "status": "cancelled"
    },
    {
      "id": "a05ba6ff-f7bd-4358-960b-8281158ea818",
      "orderNumber": "ZT372198",
      "createdAt": "2026-06-25T07:26:35.903Z",
      "customerName": "Hishi",
      "customerPhone": "99999999",
      "recipientKey": "friend",
      "recipient": "Найздаа",
      "container": {
        "id": 426840,
        "name": "Бэлгийн хайрцаг",
        "price": 8000
      },
      "items": [
        {
          "id": 776007,
          "name": "Marie мууртай аяга",
          "price": 34000
        }
      ],
      "message": "",
      "subtotal": 42000,
      "deliveryFee": 7000,
      "total": 49000,
      "status": "cancelled"
    },
    {
      "id": "47725418-22ea-4228-8f3f-44b4ee4a098b",
      "orderNumber": "ZT739914",
      "createdAt": "2026-06-27T03:51:11.584Z",
      "customerName": "Enkhjin test",
      "customerPhone": "90081008",
      "deliveryDistrict": "Сонгинохайрхан",
      "deliveryKhoroo": "5",
      "deliveryAddress": "Bnshzn",
      "recipientKey": "partner",
      "recipient": "Хайртдаа",
      "container": {
        "id": 426839,
        "name": "Бэлгийн хайрцаг",
        "price": 6000
      },
      "items": [
        {
          "id": 778920,
          "name": "Туулай цагаан, ягаан",
          "price": 35000
        },
        {
          "id": 429144,
          "name": "Зүрхэн шилтэй лаа",
          "price": 8000
        },
        {
          "id": 897063,
          "name": "Ягаан сарнайтай баглаа",
          "price": 40000
        },
        {
          "id": 419641,
          "name": "Төрсөн өдрийн мэндчилгээ #2",
          "price": 1500
        }
      ],
      "message": "",
      "subtotal": 90500,
      "deliveryFee": 7000,
      "couponCode": "",
      "discount": 0,
      "total": 97500,
      "status": "cancelled"
    },
    {
      "id": "22d46ae1-0291-46df-953b-e3655f14dd8c",
      "orderNumber": "ZT739914",
      "createdAt": "2026-06-27T05:13:29.981Z",
      "customerName": "Enkhjin test2",
      "customerPhone": "90081008",
      "deliveryDistrict": "Сонгинохайрхан",
      "deliveryKhoroo": "5",
      "deliveryAddress": "Bnshzn",
      "recipientKey": "partner",
      "recipient": "Хайртдаа",
      "container": {
        "id": 426839,
        "name": "Бэлгийн хайрцаг",
        "price": 6000
      },
      "items": [
        {
          "id": 778920,
          "name": "Туулай цагаан, ягаан",
          "price": 35000
        },
        {
          "id": 429144,
          "name": "Зүрхэн шилтэй лаа",
          "price": 8000
        },
        {
          "id": 897063,
          "name": "Ягаан сарнайтай баглаа",
          "price": 40000
        },
        {
          "id": 419641,
          "name": "Төрсөн өдрийн мэндчилгээ #2",
          "price": 1500
        }
      ],
      "message": "",
      "subtotal": 90500,
      "deliveryFee": 7000,
      "couponCode": "",
      "discount": 0,
      "total": 97500,
      "status": "cancelled"
    },
    {
      "id": "201b3ac1-224f-4161-aff3-6df6ebc2020a",
      "orderNumber": "ZT778650",
      "createdAt": "2026-06-27T05:40:18.396Z",
      "customerName": "Тест",
      "customerPhone": "99111212",
      "customerEmail": "enkhjin08@gmail.com",
      "deliveryDistrict": "Баянгол",
      "deliveryKhoroo": "",
      "deliveryAddress": "5-2",
      "recipientKey": "mom",
      "recipient": "Ээждээ",
      "container": {
        "id": 426839,
        "name": "Бэлгийн хайрцаг",
        "price": 6000
      },
      "items": [
        {
          "id": 778920,
          "name": "Туулай цагаан, ягаан",
          "price": 35000
        },
        {
          "id": 429144,
          "name": "Зүрхэн шилтэй лаа",
          "price": 8000
        },
        {
          "id": 897069,
          "name": "Улбар алтанзул",
          "price": 75000
        }
      ],
      "message": "Чи хөөрхөн",
      "subtotal": 124000,
      "deliveryFee": 7000,
      "couponCode": "",
      "discount": 0,
      "total": 131000,
      "status": "cancelled"
    },
    {
      "id": "41ad5d99-65ab-48f8-838f-d746a5583fef",
      "orderNumber": "ZT576394",
      "createdAt": "2026-07-05T12:28:49.545Z",
      "customerName": "lkhagvajargal",
      "customerPhone": "94932434",
      "customerEmail": "dobumergen2434@gmail.com",
      "deliveryDistrict": "Баянзүрх",
      "deliveryKhoroo": "26",
      "deliveryAddress": "time tower hotohn 217 bair 2orts 15 dawhar 144toot",
      "recipientKey": "",
      "recipient": "—",
      "container": null,
      "items": [
        {
          "id": 148000,
          "name": "Open when дугтуйны багц",
          "price": 25000
        }
      ],
      "message": "",
      "subtotal": 25000,
      "deliveryFee": 7000,
      "couponCode": "",
      "discount": 0,
      "total": 32000,
      "status": "confirmed"
    },
    {
      "id": "38eba1e5-1eb8-41a1-8942-77e6de44c226",
      "orderNumber": "ZT705666",
      "createdAt": "2026-07-06T03:33:45.665Z",
      "customerName": "Хишигдорж",
      "customerPhone": "95444829",
      "customerEmail": "cerebralhige@gmail.com",
      "deliveryDistrict": "Сүхбаатар",
      "deliveryKhoroo": "1",
      "deliveryAddress": "Shuren office, 2 Floor, #1",
      "recipientKey": "",
      "recipient": "—",
      "container": null,
      "items": [
        {
          "id": 148000,
          "name": "Open when дугтуйны багц",
          "price": 25000
        }
      ],
      "message": "",
      "subtotal": 25000,
      "deliveryFee": 7000,
      "couponCode": "",
      "discount": 0,
      "total": 32000,
      "status": "confirmed"
    },
    {
      "id": "d283e81c-f42f-419b-82c9-10d33a506c05",
      "orderNumber": "ZT121698",
      "createdAt": "2026-07-06T15:56:20.424Z",
      "customerName": "Ганбат",
      "customerPhone": "99196052",
      "customerEmail": "suitzaluu1001@gmail.com",
      "deliveryDistrict": "Сүхбаатар",
      "deliveryKhoroo": "10 хороо",
      "deliveryAddress": "цагдаагийн гудамж АМО төв 514\n( зуун айлын голомт, хас банктай барилга)",
      "recipientKey": "partner",
      "recipient": "Хайртдаа",
      "container": null,
      "items": [
        {
          "id": 148000,
          "name": "Open when дугтуйны багц",
          "price": 25000
        }
      ],
      "message": "",
      "subtotal": 25000,
      "deliveryFee": 7000,
      "couponCode": "",
      "discount": 0,
      "total": 32000,
      "status": "confirmed"
    },
    {
      "id": "2b83b23e-cf62-4408-b503-26bc8efcc651",
      "orderNumber": "ZT985008",
      "createdAt": "2026-07-07T03:33:05.817Z",
      "customerName": "Мөнхтуяа",
      "customerPhone": "88143729",
      "customerEmail": "munkhtuyaddd@gmail.com",
      "deliveryDistrict": "Хан-Уул",
      "deliveryKhoroo": "21",
      "deliveryAddress": "Шүрт хотхон, 813-р байр, 1-р орц, 7 давхар, 36 тоот",
      "recipientKey": "partner",
      "recipient": "Хайртдаа",
      "container": null,
      "items": [
        {
          "id": 1792394134883,
          "name": "Лонх",
          "price": 20000
        },
        {
          "id": 562709,
          "name": "Суккулент",
          "price": 23000
        }
      ],
      "message": "",
      "subtotal": 43000,
      "deliveryFee": 7000,
      "couponCode": "",
      "discount": 0,
      "total": 50000,
      "status": "confirmed"
    },
    {
      "id": "35341844-9c6a-48f9-9f93-a28a19c1abef",
      "orderNumber": "ZT319183",
      "createdAt": "2026-07-07T03:37:53.617Z",
      "customerName": "tsenguun",
      "customerPhone": "88175035",
      "customerEmail": "tsenguunaltangerel82@gmail.com",
      "deliveryDistrict": "Сонгинохайрхан",
      "deliveryKhoroo": "12r horoo",
      "deliveryAddress": "1r horoolol Sapporo 2r bair 2r orts 6 davhar 60 toot\nortsnii code 60B",
      "recipientKey": "",
      "recipient": "—",
      "container": null,
      "items": [
        {
          "id": 1792394134883,
          "name": "Лонх",
          "price": 20000
        },
        {
          "id": 422030,
          "name": "Дугтуй",
          "price": 3500
        },
        {
          "id": 423064,
          "name": "Хайрын купон цулгай",
          "price": 12000
        }
      ],
      "message": "",
      "subtotal": 35500,
      "deliveryFee": 7000,
      "couponCode": "",
      "discount": 0,
      "total": 42500,
      "status": "confirmed"
    },
    {
      "id": "6a14f3db-bde5-4681-8ac5-62be6d39d71f",
      "orderNumber": "ZT631813",
      "createdAt": "2026-07-08T09:07:38.431Z",
      "customerName": "Enkhjin test",
      "customerPhone": "90081808",
      "customerEmail": "enkhjin08@gmail.com",
      "deliveryDistrict": "Баянзүрх",
      "deliveryKhoroo": "",
      "deliveryAddress": "Hahshshha",
      "recipientKey": "partner",
      "recipient": "Хайртдаа",
      "container": null,
      "items": [
        {
          "id": 1792062193727,
          "name": "Тавагтай аяга (shiba)",
          "price": 40000
        }
      ],
      "message": "",
      "subtotal": 40000,
      "deliveryFee": 7000,
      "couponCode": "",
      "discount": 0,
      "total": 47000,
      "status": "cancelled"
    },
    {
      "id": "1d907138-5554-4479-8462-0b1512f4d750",
      "orderNumber": "ZT159613",
      "createdAt": "2026-07-08T09:16:25.031Z",
      "customerName": "Eegii",
      "customerPhone": "90081808",
      "customerEmail": "enkhjin08@gmail.com",
      "deliveryDistrict": "Сонгинохайрхан",
      "deliveryKhoroo": "",
      "deliveryAddress": "Hshs",
      "recipientKey": "",
      "recipient": "—",
      "container": null,
      "items": [
        {
          "id": 1792060267782,
          "name": "Тавагтай аяга (шар цэцэгтэй)",
          "price": 32000
        }
      ],
      "message": "",
      "subtotal": 32000,
      "deliveryFee": 7000,
      "couponCode": "",
      "discount": 0,
      "total": 39000,
      "status": "cancelled"
    },
    {
      "id": "d759711c-eb08-4a86-8e10-e7cee3299c9f",
      "orderNumber": "ZT633425",
      "createdAt": "2026-07-08T09:24:14.521Z",
      "customerName": "Test2",
      "customerPhone": "90081808",
      "customerEmail": "enkhjin08@gmail.com",
      "deliveryDistrict": "Сүхбаатар",
      "deliveryKhoroo": "",
      "deliveryAddress": "He",
      "recipientKey": "",
      "recipient": "—",
      "container": null,
      "items": [
        {
          "id": 778920,
          "name": "Туулайтай аяга (цагаан)",
          "price": 35000
        }
      ],
      "message": "",
      "subtotal": 35000,
      "deliveryFee": 7000,
      "couponCode": "",
      "discount": 0,
      "total": 42000,
      "status": "cancelled"
    },
    {
      "id": "1d8746b9-8ae9-4c4c-893e-40d53a34f58a",
      "orderNumber": "ZT869617",
      "createdAt": "2026-07-08T09:28:09.850Z",
      "customerName": "Eee",
      "customerPhone": "90081808",
      "customerEmail": "enkhjin08@gmail.com",
      "deliveryDistrict": "Сонгинохайрхан",
      "deliveryKhoroo": "",
      "deliveryAddress": "Haha",
      "recipientKey": "",
      "recipient": "—",
      "container": null,
      "items": [
        {
          "id": 1792062193727,
          "name": "Тавагтай аяга (shiba)",
          "price": 40000
        }
      ],
      "message": "",
      "subtotal": 40000,
      "deliveryFee": 7000,
      "couponCode": "",
      "discount": 0,
      "total": 47000,
      "status": "cancelled"
    },
    {
      "id": "0fa28b4a-7212-4116-8589-01b081236e47",
      "orderNumber": "ZT010769",
      "createdAt": "2026-07-08T09:48:13.960Z",
      "customerName": "Лхагва",
      "customerPhone": "99213939",
      "customerEmail": "ochirhuyagtsengelmaa@gmail.com",
      "deliveryDistrict": "Сонгинохайрхан",
      "deliveryKhoroo": "39",
      "deliveryAddress": "Хангайн 45-13а тоот",
      "recipientKey": "mom",
      "recipient": "Ээждээ",
      "container": {
        "id": 426839,
        "name": "Бэлгийн хайрцаг 20*20",
        "price": 6000
      },
      "items": [
        {
          "id": 429144,
          "name": "Зүрхэн шилтэй лаа",
          "price": 8000
        },
        {
          "id": 897024,
          "name": "Шар мини сарнайтай баглаа",
          "price": 60000
        }
      ],
      "message": "Тань даа маш их хайртай шүү үргэлж охиныхоо дэргэд үүрд жаргаарай та минь үнсье",
      "subtotal": 74000,
      "deliveryFee": 10000,
      "couponCode": "",
      "discount": 0,
      "total": 84000,
      "status": "cancelled"
    },
    {
      "id": "7bdd692d-f237-492a-b785-25fc8fd6a713",
      "orderNumber": "ZT812455",
      "createdAt": "2026-07-08T11:24:48.939Z",
      "customerName": "nandin erdene",
      "customerPhone": "91200076",
      "customerEmail": "nndia027@gmail.com",
      "deliveryDistrict": "Сонгинохайрхан",
      "deliveryKhoroo": "10",
      "deliveryAddress": "baynhoshuunii shine etes hoishoo ywad booni bairin 4-1 toot",
      "recipientKey": "mom",
      "recipient": "Ээждээ",
      "container": {
        "id": 426840,
        "name": "Бэлгийн хайрцаг 25*25",
        "price": 8000
      },
      "items": [
        {
          "id": 789590,
          "name": "Love you #3 багц",
          "price": 30000
        },
        {
          "id": 789589,
          "name": "Love you #2 багц",
          "price": 62000
        }
      ],
      "message": "",
      "subtotal": 100000,
      "deliveryFee": 7000,
      "couponCode": "",
      "discount": 0,
      "total": 107000,
      "status": "cancelled"
    },
    {
      "id": "42596309-638a-4473-bfa0-d6bcaad9a801",
      "orderNumber": "ZT098158",
      "createdAt": "2026-07-08T15:41:05.294Z",
      "customerName": "Э",
      "customerPhone": "89827379",
      "customerEmail": "ganbat.enkhenerell@gmail.com",
      "deliveryDistrict": "Баянзүрх",
      "deliveryKhoroo": "",
      "deliveryAddress": "29байр 9орц 3давхар 300тоот",
      "recipientKey": "self",
      "recipient": "Өөртөө",
      "container": null,
      "items": [
        {
          "id": 426839,
          "name": "Бэлгийн хайрцаг 20*20",
          "price": 6000
        },
        {
          "id": 400567,
          "name": "Банхар sticky note",
          "price": 4000
        }
      ],
      "message": "Чи бол жинхэнэ гүнж юм шүү💗\nЭгшиглэн өөртөө зориулав",
      "subtotal": 10000,
      "deliveryFee": 7000,
      "couponCode": "",
      "discount": 0,
      "total": 17000,
      "status": "cancelled"
    },
    {
      "id": "527c52ed-54b0-48c1-b6c7-4e91acb7ab24",
      "orderNumber": "ZT279984",
      "createdAt": "2026-07-08T19:38:09.992Z",
      "customerName": "Jennie",
      "customerPhone": "96656388",
      "customerEmail": "gzulaa2004@gmail.com",
      "deliveryDistrict": "Баянгол",
      "deliveryKhoroo": "28",
      "deliveryAddress": "10r horoolol tuvshin urguu hothon 305 baid 15 toot",
      "recipientKey": "mom",
      "recipient": "Ээждээ",
      "container": {
        "id": 426840,
        "name": "Бэлгийн хайрцаг 25*25",
        "price": 8000
      },
      "items": [
        {
          "id": 562623,
          "name": "Кактус",
          "price": 23000
        },
        {
          "id": 148000,
          "name": "Open when дугтуйны багц",
          "price": 25000
        },
        {
          "id": 1791893767590,
          "name": "Хос аяга",
          "price": 75000
        },
        {
          "id": 809544,
          "name": "To-do list",
          "price": 28000
        },
        {
          "id": 897069,
          "name": "Улбар алтанзул",
          "price": 75000
        },
        {
          "id": 1791893767590,
          "name": "Хос аяга",
          "price": 75000
        },
        {
          "id": 429144,
          "name": "Зүрхэн шилтэй лаа",
          "price": 8000
        },
        {
          "id": 434516,
          "name": "\"Банхар\" төлөвлөгч",
          "price": 30000
        },
        {
          "id": 400570,
          "name": "Гэр sticky note",
          "price": 4000
        }
      ],
      "message": "",
      "subtotal": 351000,
      "deliveryFee": 10000,
      "couponCode": "",
      "discount": 0,
      "total": 361000,
      "status": "cancelled"
    },
    {
      "id": "f5641abc-c612-4ab6-a370-c43a528f21b9",
      "orderNumber": "ZT456235",
      "createdAt": "2026-07-08T19:55:53.784Z",
      "customerName": "Xongor Zul",
      "customerPhone": "95335224",
      "customerEmail": "zulxongor231@gmail.com",
      "deliveryDistrict": "Багахангай",
      "deliveryKhoroo": "1р хороо",
      "deliveryAddress": "1р байр 92тоот",
      "recipientKey": "self",
      "recipient": "Өөртөө",
      "container": {
        "id": 426839,
        "name": "Бэлгийн хайрцаг 20*20",
        "price": 6000
      },
      "items": [
        {
          "id": 425004,
          "name": "Тооройтой аяга",
          "price": 38000
        },
        {
          "id": 400567,
          "name": "Банхар sticky note",
          "price": 4000
        },
        {
          "id": 896593,
          "name": "Хонгорзул ягаан",
          "price": 13000
        }
      ],
      "message": "Чи бол гал охин шүү.\nЦаашдаа ч ийм ээрээ гэгээлэг цог золбоотой байгаарай.\nБусдын төлөө биш өөрийнхөө төлөө амьдраарай. \nБусад хүн юу гэж бодох бол гэлгүй өөрийхөөрөө байгаарай. 💗",
      "subtotal": 61000,
      "deliveryFee": 10000,
      "couponCode": "",
      "discount": 0,
      "total": 71000,
      "status": "cancelled"
    },
    {
      "id": "706ac9f5-f97e-4b4f-91a6-ed94ff7fca61",
      "orderNumber": "ZT940235",
      "createdAt": "2026-07-09T02:59:51.102Z",
      "customerName": "Enkhtsetseg",
      "customerPhone": "85247446",
      "customerEmail": "enkhtsetsegb681@gmail.com",
      "deliveryDistrict": "Баянзүрх",
      "deliveryKhoroo": "",
      "deliveryAddress": "Orchlon",
      "recipientKey": "",
      "recipient": "—",
      "container": null,
      "items": [
        {
          "id": 425004,
          "name": "Тооройтой аяга",
          "price": 38000
        }
      ],
      "message": "",
      "subtotal": 38000,
      "deliveryFee": 7000,
      "couponCode": "",
      "discount": 0,
      "total": 45000,
      "status": "cancelled"
    },
    {
      "id": "746d957b-ffcb-45d0-b53a-720ea7e24cce",
      "orderNumber": "ZT330887",
      "createdAt": "2026-07-11T17:59:37.033Z",
      "customerName": "Үүлээ",
      "customerPhone": "86115877",
      "customerEmail": "@Boldoo.",
      "deliveryDistrict": "Баянзүрх",
      "deliveryKhoroo": "",
      "deliveryAddress": "13/4/7/8",
      "recipientKey": "mom",
      "recipient": "Ээждээ",
      "container": {
        "id": 426840,
        "name": "Бэлгийн хайрцаг 25*25",
        "price": 8000
      },
      "items": [
        {
          "id": 789590,
          "name": "Love you #3 багц",
          "price": 30000
        },
        {
          "id": 429144,
          "name": "Зүрхэн шилтэй лаа",
          "price": 8000
        },
        {
          "id": 896550,
          "name": "Lily цэцгийн баглаа",
          "price": 60000
        },
        {
          "id": 897063,
          "name": "Ягаан сарнайтай баглаа",
          "price": 40000
        },
        {
          "id": 897069,
          "name": "Улбар алтанзул",
          "price": 75000
        },
        {
          "id": 897024,
          "name": "Шар мини сарнайтай баглаа",
          "price": 60000
        },
        {
          "id": 897023,
          "name": "Хонгорзул цэцгийн баглаа",
          "price": 44000
        },
        {
          "id": 419641,
          "name": "Төрсөн өдрийн мэндчилгээ #2",
          "price": 1500
        },
        {
          "id": 419642,
          "name": "Төрсөн өдрийн мэндчилгээ #3",
          "price": 1500
        },
        {
          "id": 1792049729772,
          "name": "Happy birthday аяга",
          "price": 38000
        },
        {
          "id": 427859,
          "name": "Meow #3",
          "price": 69000
        },
        {
          "id": 594190,
          "name": "Love you #4",
          "price": 60000
        },
        {
          "id": 789589,
          "name": "Love you #2 багц",
          "price": 62000
        },
        {
          "id": 789590,
          "name": "Love you #3 багц",
          "price": 30000
        },
        {
          "id": 789587,
          "name": "Love you багц #1",
          "price": 29000
        },
        {
          "id": 300844,
          "name": "Love you #3",
          "price": 75000
        },
        {
          "id": 426840,
          "name": "Бэлгийн хайрцаг 25*25",
          "price": 8000
        },
        {
          "id": 426839,
          "name": "Бэлгийн хайрцаг 20*20",
          "price": 6000
        },
        {
          "id": 434516,
          "name": "\"Банхар\" төлөвлөгч",
          "price": 30000
        },
        {
          "id": 809544,
          "name": "To-do list",
          "price": 28000
        },
        {
          "id": 400567,
          "name": "Банхар sticky note",
          "price": 4000
        },
        {
          "id": 778914,
          "name": "Cat tail",
          "price": 34000
        },
        {
          "id": 776043,
          "name": "One piece Asce аяга таваг",
          "price": 43000
        },
        {
          "id": 1792051141125,
          "name": "Үүлэн зүрхтэй аяга (цэнхэр)",
          "price": 32000
        },
        {
          "id": 896597,
          "name": "Шар мини сарнайтай баглаа",
          "price": 45000
        },
        {
          "id": 896536,
          "name": "Мини сарнай цайвар ягаан",
          "price": 17000
        }
      ],
      "message": "Ээжээ та минь буохнаас илүү алтнаас үнтэй мөнгөнөөс уянхан хүн шүү хайртай шүү ээждэй🌹",
      "subtotal": 938000,
      "deliveryFee": 10000,
      "couponCode": "",
      "discount": 0,
      "total": 948000,
      "status": "cancelled"
    },
    {
      "id": "3be1c715-8d03-43e7-9389-96c93d5acb8f",
      "orderNumber": "ZT737656",
      "createdAt": "2026-07-17T15:24:22.447Z",
      "customerName": "Uynga",
      "customerPhone": "91112391",
      "customerEmail": "khaku@mail.com",
      "deliveryDistrict": "Баянзүрх",
      "deliveryKhoroo": "26",
      "deliveryAddress": "True l hothon 720 bair 6 davhar 601 toot",
      "recipientKey": "mom",
      "recipient": "Ээждээ",
      "container": null,
      "items": [
        {
          "id": 789587,
          "name": "Love you багц #1",
          "price": 29000
        }
      ],
      "message": "",
      "subtotal": 29000,
      "deliveryFee": 7000,
      "couponCode": "",
      "discount": 0,
      "total": 36000,
      "status": "cancelled"
    },
    {
      "id": "06097ca4-297c-42e4-9a9e-f84202c7c0ab",
      "orderNumber": "ZT084424",
      "createdAt": "2026-07-17T15:28:58.882Z",
      "customerName": "Номин",
      "customerPhone": "99696290",
      "customerEmail": "nominerdene1234n@gmail.com",
      "deliveryDistrict": "Хан-Уул",
      "deliveryKhoroo": "",
      "deliveryAddress": "Эвэл хотхон",
      "recipientKey": "friend",
      "recipient": "Найздаа",
      "container": {
        "id": 426839,
        "name": "Бэлгийн хайрцаг 20*20",
        "price": 6000
      },
      "items": [
        {
          "id": 419641,
          "name": "Төрсөн өдрийн мэндчилгээ #2",
          "price": 1500
        },
        {
          "id": 426839,
          "name": "Бэлгийн хайрцаг 20*20",
          "price": 6000
        },
        {
          "id": 896537,
          "name": "Наранцэцэг",
          "price": 15000
        }
      ],
      "message": "Амьдралд минь өнга нэмж орж ирсэнд баярлалаа❤❤Миний талд орж намайг ойлгож орхидоггүйд баярлалаа💕💕Хайртай шүү сайхан баярлаарай😘😘😘",
      "subtotal": 28500,
      "deliveryFee": 10000,
      "couponCode": "",
      "discount": 0,
      "total": 38500,
      "status": "cancelled"
    },
    {
      "id": "7fcad464-d8a2-498b-8af6-57a0440c2a25",
      "orderNumber": "ZT784522",
      "createdAt": "2026-07-17T23:51:12.613Z",
      "customerName": "Anujin",
      "customerPhone": "88850093",
      "customerEmail": "anukaanukaaa3@gmail.com",
      "deliveryDistrict": "Сонгинохайрхан",
      "deliveryKhoroo": "36",
      "deliveryAddress": "Altan ovoo 30-13toot \nTogs baylag delguuriin urtliin gudan",
      "recipientKey": "partner",
      "recipient": "Хайртдаа",
      "container": {
        "id": 426839,
        "name": "Бэлгийн хайрцаг 20*20",
        "price": 6000
      },
      "items": [
        {
          "id": 1792055523209,
          "name": "Drink more water (хар)",
          "price": 23000
        },
        {
          "id": 429144,
          "name": "Зүрхэн шилтэй лаа",
          "price": 8000
        }
      ],
      "message": "Чи бол миний хувьд зүгээр нэг хайртай хүн биш. Чи бол миний тайвшрал, миний урам зориг, миний ирээдүйн мөрөөдөл.\nЧамайг хайрлах сэтгэл минь үгээр хэмжигдэхгүй их. Амьдралын минь өдөр бүрт чи байгаасай, гар гараасаа атгаад олон сайхан дурсамжийг хамт бүтээж, насан туршдаа бие биенийхээ түшиг тулгуур нь байгаасай гэж хүсдэг.",
      "subtotal": 37000,
      "deliveryFee": 7000,
      "couponCode": "",
      "discount": 0,
      "total": 44000,
      "status": "confirmed"
    },
    {
      "id": "b734f4f7-e148-45a1-b5c3-4f8f734f367f",
      "orderNumber": "ZT414637",
      "createdAt": "2026-07-19T04:33:31.032Z",
      "customerName": "Дарь",
      "customerPhone": "90199067",
      "customerEmail": "darid5899@gmail.com",
      "deliveryDistrict": "Сүхбаатар",
      "deliveryKhoroo": "",
      "deliveryAddress": "Багшийн дээд Burger king",
      "recipientKey": "partner",
      "recipient": "Хайртдаа",
      "container": {
        "id": 426840,
        "name": "Бэлгийн хайрцаг 25*25",
        "price": 8000
      },
      "items": [
        {
          "id": 150174,
          "name": "Хайрын купон",
          "price": 15000
        },
        {
          "id": 422030,
          "name": "Дугтуй",
          "price": 3500
        }
      ],
      "message": "миний амьдралд орж ирсэн чамд баярлалаа хайртай шүү жужигаааа🫶",
      "subtotal": 26500,
      "deliveryFee": 7000,
      "couponCode": "",
      "discount": 0,
      "total": 33500,
      "status": "done"
    },
    {
      "id": "f7db9e0d-62a0-41b3-a41e-54aaa7167abe",
      "orderNumber": "ZT017532",
      "createdAt": "2026-07-20T07:10:41.540Z",
      "customerName": "Энхчимэг",
      "customerPhone": "86865434",
      "customerEmail": "enhchimegenhchimeg@53gmail.mn",
      "deliveryDistrict": "Баянзүрх",
      "deliveryKhoroo": "",
      "deliveryAddress": "Ботаник соёмбтой байрын хажуудах соёмбгүй байр 1 дүгээр орц  код 7945# 14 давхар 51 тоот",
      "recipientKey": "self",
      "recipient": "Өөртөө",
      "container": {
        "id": 426840,
        "name": "Бэлгийн хайрцаг 25*25",
        "price": 8000
      },
      "items": [
        {
          "id": 435602,
          "name": "Банхар төлөвлөгч багц",
          "price": 35000
        },
        {
          "id": 778920,
          "name": "Туулайтай аяга (цагаан)",
          "price": 35000
        },
        {
          "id": 482901,
          "name": "Төлөвлөгч багц",
          "price": 70000
        },
        {
          "id": 424760,
          "name": "Mrs. Pot and Chip",
          "price": 108000
        },
        {
          "id": 1792062193727,
          "name": "Тавагтай аяга (shiba)",
          "price": 40000
        },
        {
          "id": 778914,
          "name": "Cat tail",
          "price": 34000
        },
        {
          "id": 809544,
          "name": "To-do list",
          "price": 28000
        },
        {
          "id": 778896,
          "name": "Butterfly аяга 3 өнгө",
          "price": 30000
        },
        {
          "id": 778904,
          "name": "Cute cat (ягаан)",
          "price": 34000
        },
        {
          "id": 427859,
          "name": "Meow #3",
          "price": 69000
        },
        {
          "id": 776048,
          "name": "Том тавагтай мууртай аяга (саарал)",
          "price": 40000
        },
        {
          "id": 776012,
          "name": "Harry Potter ном аяга",
          "price": 52000
        },
        {
          "id": 594192,
          "name": "Аягатай багц #1",
          "price": 70000
        },
        {
          "id": 450487,
          "name": "One piece SABO аяга таваг",
          "price": 43000
        },
        {
          "id": 427860,
          "name": "Meow #4",
          "price": 69000
        },
        {
          "id": 1792060267782,
          "name": "Тавагтай аяга (шар цэцэгтэй)",
          "price": 32000
        },
        {
          "id": 562623,
          "name": "Кактус",
          "price": 23000
        },
        {
          "id": 776033,
          "name": "Нохойтой аяга",
          "price": 39000
        },
        {
          "id": 429144,
          "name": "Зүрхэн шилтэй лаа",
          "price": 8000
        },
        {
          "id": 896551,
          "name": "Lily цэцгийн баглаа",
          "price": 59000
        },
        {
          "id": 896544,
          "name": "Мини сарнай ягаан",
          "price": 17000
        },
        {
          "id": 1793448023360,
          "name": "Мини ягаан сарнайн баглаа",
          "price": 47500
        },
        {
          "id": 419642,
          "name": "Төрсөн өдрийн мэндчилгээ #3",
          "price": 1500
        },
        {
          "id": 789590,
          "name": "Love you #3 багц",
          "price": 30000
        },
        {
          "id": 789589,
          "name": "Love you #2 багц",
          "price": 62000
        },
        {
          "id": 896597,
          "name": "Шар мини сарнайтай баглаа",
          "price": 45000
        }
      ],
      "message": "Hairtai shuu chi mundag💘",
      "subtotal": 1129000,
      "deliveryFee": 10000,
      "couponCode": "",
      "discount": 0,
      "total": 1139000,
      "status": "cancelled"
    },
    {
      "id": "25bd4130-c249-47e1-9810-4bf3d8aa630c",
      "orderNumber": "ZT557052",
      "createdAt": "2026-07-21T04:30:07.918Z",
      "customerName": "Khishiglen",
      "customerPhone": "88772900",
      "customerEmail": "khushiglen.o@gmail.com",
      "deliveryDistrict": "Хан-Уул",
      "deliveryKhoroo": "",
      "deliveryAddress": "King tower 126bair 1 dawxar 101 toot",
      "recipientKey": "mom",
      "recipient": "Ээждээ",
      "container": {
        "id": 426839,
        "name": "Бэлгийн хайрцаг 20*20",
        "price": 6000
      },
      "items": [
        {
          "id": 429144,
          "name": "Зүрхэн шилтэй лаа",
          "price": 8000
        },
        {
          "id": 896536,
          "name": "Мини сарнай цайвар ягаан",
          "price": 17000
        },
        {
          "id": 419641,
          "name": "Төрсөн өдрийн мэндчилгээ #2",
          "price": 1500
        }
      ],
      "message": "Ээж минь таны минь хайр халамж намайг өдөр бүр хүчтэй зөв хүн болоход тусалдаг. Миний төлөө үргэлж санаа тавьж бүхнээ зориулдаг танд маш их баярлалаа. \nТаны инээмсэглэл миний аз жаргал таны зөвлөгөө миний замыг гэрэлтүүлдэг. Таныгаа үргэлж хайрлаж бахархаж явна.Эрүүл энх аз жаргалтай байгаарай ээжээ❤️",
      "subtotal": 32500,
      "deliveryFee": 10000,
      "couponCode": "",
      "discount": 0,
      "total": 42500,
      "status": "confirmed"
    },
    {
      "id": "c86d00b0-2f26-4044-824a-d24ef4630491",
      "orderNumber": "ZT698367",
      "createdAt": "2026-07-21T10:50:56.780Z",
      "customerName": "Төрмөнх",
      "customerPhone": "99576616",
      "customerEmail": "tsturmunkh84@gmail.com",
      "deliveryDistrict": "Хан-Уул",
      "deliveryKhoroo": "15-р хороо",
      "deliveryAddress": "Хан-Уул дүүрэг 15-р хорооо Рапид харш 4-р байр 4давхар 22тоот",
      "recipientKey": "partner",
      "recipient": "Хайртдаа",
      "container": {
        "id": 426839,
        "name": "Бэлгийн хайрцаг 20*20",
        "price": 6000
      },
      "items": [
        {
          "id": 148000,
          "name": "Open when дугтуйны багц",
          "price": 25000
        },
        {
          "id": 1792054785749,
          "name": "Drink more water (цагаан)",
          "price": 23000
        },
        {
          "id": 1792055523209,
          "name": "Drink more water (хар)",
          "price": 23000
        }
      ],
      "message": "",
      "subtotal": 77000,
      "deliveryFee": 7000,
      "couponCode": "",
      "discount": 0,
      "total": 84000,
      "status": "cancelled"
    },
    {
      "id": "81bd4af6-41b5-4785-bddf-da570220e72e",
      "orderNumber": "ZT638862",
      "createdAt": "2026-07-22T05:16:07.174Z",
      "customerName": "Баярмаа",
      "customerPhone": "80145413",
      "customerEmail": "bamaab92@gmail.com",
      "deliveryDistrict": "Чингэлтэй",
      "deliveryKhoroo": "15",
      "deliveryAddress": "Жаргалантын 63 р гудамж 986 тоот",
      "recipientKey": "kid",
      "recipient": "Дүүдээ",
      "container": {
        "id": 426839,
        "name": "Бэлгийн хайрцаг 20*20",
        "price": 6000
      },
      "items": [
        {
          "id": 1792049729772,
          "name": "Happy birthday аяга",
          "price": 38000
        },
        {
          "id": 419641,
          "name": "Төрсөн өдрийн мэндчилгээ #2",
          "price": 1500
        }
      ],
      "message": "Хөөрхөн охиндоо: \nЭнэ хорвоод ээж аавдаа\nЭнхрий бяцхан охин минь болж ирсэнд маш их баярлалаа.Охиндоо хязгааргүй их хайртай шүү.Миний охин үргэлж бусдад тусалж сайхан сэтгэлээр хандаж энэ сайхан зангаараа эргэх орчлонг гэрэлтүүлж яваарай гэж ээж нь хүсэн ерөөе.Орчлонг үргэлжлүүлэх охин минь чамдаа 10насны төрсөн өдрийн баярын мэндийг хүргье.Хайртай шүү үр минь.Үнсье",
      "subtotal": 45500,
      "deliveryFee": 7000,
      "couponCode": "",
      "discount": 0,
      "total": 52500,
      "status": "new"
    },
    {
      "id": "d2f97ea1-90c0-49c8-af9a-648dd1d878fe",
      "orderNumber": "ZT669717",
      "createdAt": "2026-07-22T13:19:47.662Z",
      "customerName": "Ulziibat",
      "customerPhone": "85648997",
      "customerEmail": "mdkuemdku5599@gmail.com",
      "deliveryDistrict": "Хан-Уул",
      "deliveryKhoroo": "24khoroo",
      "deliveryAddress": "Viva city m12 3davhar 3toot",
      "recipientKey": "partner",
      "recipient": "Хайртдаа",
      "container": {
        "id": 426840,
        "name": "Бэлгийн хайрцаг 25*25",
        "price": 8000
      },
      "items": [
        {
          "id": 148000,
          "name": "Open when дугтуйны багц",
          "price": 25000
        },
        {
          "id": 1792394134883,
          "name": "Лонх",
          "price": 20000
        }
      ],
      "message": "",
      "subtotal": 53000,
      "deliveryFee": 7000,
      "couponCode": "",
      "discount": 0,
      "total": 60000,
      "status": "confirmed"
    },
    {
      "id": "ae16937c-d2bd-48a6-bb75-f7047e427a19",
      "orderNumber": "ZT046903",
      "createdAt": "2026-07-23T02:56:10.929Z",
      "customerName": "Эмүжин",
      "customerPhone": "88635885",
      "customerEmail": "emujine42@gmail.com",
      "deliveryDistrict": "Баянзүрх",
      "deliveryKhoroo": "5-р хороо",
      "deliveryAddress": "Dream apartment 94б байр 8 давхар 801 тоот\n(69-р сургуулийн ард талд)",
      "recipientKey": "friend",
      "recipient": "Найздаа",
      "container": null,
      "items": [
        {
          "id": 1792049153116,
          "name": "Урт бариултай аяга (улаан)",
          "price": 26000
        },
        {
          "id": 1792049123902,
          "name": "Урт бариултай аяга (цэнхэр)",
          "price": 26000
        },
        {
          "id": 1792055523209,
          "name": "Drink more water (хар)",
          "price": 23000
        }
      ],
      "message": "",
      "subtotal": 75000,
      "deliveryFee": 7000,
      "couponCode": "",
      "discount": 0,
      "total": 82000,
      "status": "confirmed"
    },
    {
      "id": "8c107b06-c9f7-4db6-b5c9-1194649d1885",
      "orderNumber": "ZT797723",
      "createdAt": "2026-07-23T05:53:59.585Z",
      "customerName": "Номин",
      "customerPhone": "91215010",
      "customerEmail": "nominbilegsaikhan247@gmail.com",
      "deliveryDistrict": "Чингэлтэй",
      "deliveryKhoroo": "3р хороо",
      "deliveryAddress": "cafe de lolita гийн хажуу талын GS25",
      "recipientKey": "mom",
      "recipient": "Ээждээ",
      "container": {
        "id": 426839,
        "name": "Бэлгийн хайрцаг 20*20",
        "price": 6000
      },
      "items": [
        {
          "id": 809544,
          "name": "To-do list",
          "price": 28000
        },
        {
          "id": 896537,
          "name": "Наранцэцэг",
          "price": 15000
        }
      ],
      "message": "Үргэлж инээмсэглэж яваарай✨",
      "subtotal": 49000,
      "deliveryFee": 10000,
      "couponCode": "",
      "discount": 0,
      "total": 59000,
      "status": "confirmed"
    },
    {
      "id": "df0f6221-1a80-4ca4-a789-1a3b694bf491",
      "orderNumber": "ZT193661",
      "createdAt": "2026-07-23T06:15:50.145Z",
      "customerName": "Элбэрэлзаяа",
      "customerPhone": "88607351",
      "customerEmail": "enkhjin08@gmail.com",
      "deliveryDistrict": "Баянзүрх",
      "deliveryKhoroo": "19",
      "deliveryAddress": "Lux16 12давхар 1206тоот",
      "recipientKey": "friend",
      "recipient": "Найздаа",
      "container": {
        "id": 426839,
        "name": "Бэлгийн хайрцаг 20*20",
        "price": 6000
      },
      "items": [
        {
          "id": 1792049729772,
          "name": "Happy birthday аяга",
          "price": 38000
        },
        {
          "id": 429144,
          "name": "Зүрхэн шилтэй лаа",
          "price": 8000
        },
        {
          "id": 419642,
          "name": "Төрсөн өдрийн мэндчилгээ #3",
          "price": 1500
        }
      ],
      "message": "Төрсөн өдрийн мэнд хүргэе найз минь🥰 Чамдаа хамгийн жаргалтай ,инээд хөөрөөр дүүрэн бүхнийг хүсэе. Эрүүл энх байж хүссэн бүхэн чинь биелэж, мөрөөдөл болгон чинь чам руу нэг нэгээрээ ойртож байгаасай🫶🏻Чамтай найзууд болсон минь үнэхээр үнэ цэнэтэй шүү",
      "subtotal": 53500,
      "deliveryFee": 7000,
      "couponCode": "",
      "discount": 0,
      "total": 60500,
      "status": "confirmed"
    },
    {
      "id": "750127bc-0e1f-4d27-86eb-f3c368bf1b51",
      "orderNumber": "ZT946045",
      "createdAt": "2026-07-23T06:43:42.474Z",
      "customerName": "Элбэрэлзаяа",
      "customerPhone": "88607351",
      "customerEmail": "enkhjin08@gmail.com",
      "deliveryDistrict": "Баянзүрх",
      "deliveryKhoroo": "19",
      "deliveryAddress": "Бананат өргөө 12давхар 1206тоот",
      "recipientKey": "friend",
      "recipient": "Найздаа",
      "container": {
        "id": 426839,
        "name": "Бэлгийн хайрцаг 20*20",
        "price": 6000
      },
      "items": [
        {
          "id": 1792049729772,
          "name": "Happy birthday аяга",
          "price": 38000
        },
        {
          "id": 422030,
          "name": "Дугтуй",
          "price": 3500
        },
        {
          "id": 429144,
          "name": "Зүрхэн шилтэй лаа",
          "price": 8000
        },
        {
          "id": 419642,
          "name": "Төрсөн өдрийн мэндчилгээ #3",
          "price": 1500
        }
      ],
      "message": "Төрсөн өдрийн мэнд хүргэе хайрт найз минь🥰 Чамдаа хамгийн аз жаргалтай инээд хөөрөөр дүүрэн төрсөн өдрийг хүсэе. Эрүүл энх байж хүссэн бүхэн чинь биелж мөрөөдөл болгон чинь чам руу нэг нэгээрээ ойртож байгаасай.Чамтай найзууд болсон нь миний хувьд үнэхээр үнэ цэнтэй зүйл шүү🫶",
      "subtotal": 57000,
      "deliveryFee": 7000,
      "couponCode": "",
      "discount": 0,
      "total": 64000,
      "status": "new"
    },
    {
      "id": "c1981727-8d2a-4282-b7fc-d4b02d3bc1b8",
      "orderNumber": "ZT325425",
      "createdAt": "2026-07-24T02:57:44.265Z",
      "customerName": "Zolboo",
      "customerPhone": "89928420",
      "customerEmail": "zolbooerdeneochir0527@gmail.com",
      "deliveryDistrict": "Налайх",
      "deliveryKhoroo": "Tuv Batsumber",
      "deliveryAddress": "Tuv Batsumber huuchin dragonoos starex yvna",
      "recipientKey": "friend",
      "recipient": "Найздаа",
      "container": {
        "id": 426839,
        "name": "Бэлгийн хайрцаг 20*20",
        "price": 6000
      },
      "items": [
        {
          "id": 896605,
          "name": "Наранцэцэгтэй баглаа",
          "price": 25000
        },
        {
          "id": 562623,
          "name": "Кактус",
          "price": 23000
        }
      ],
      "message": "Үжинд🌼🌼",
      "subtotal": 54000,
      "deliveryFee": 10000,
      "couponCode": "",
      "discount": 0,
      "total": 64000,
      "status": "confirmed"
    }
  ],
  "products": [
    {
      "id": 1791892564517,
      "name": "Туулайтай аяга (ягаан)",
      "price": 35000,
      "oldPrice": null,
      "category": "cup",
      "role": "main",
      "soldOut": false,
      "bestSeller": false,
      "tag": "",
      "images": [
        "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501160680_ktaj3hmkyrkzbw2svf5c.png"
      ],
      "image": "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501160680_ktaj3hmkyrkzbw2svf5c.png",
      "url": "",
      "custom": true,
      "createdAt": "2026-07-01T07:56:04.517Z",
      "recipients": [
        "partner",
        "friend",
        "self",
        "kid"
      ]
    },
    {
      "id": 1791893137106,
      "name": "Том тавагтай мууртай аяга (шар)",
      "price": 40000,
      "oldPrice": null,
      "category": "cup",
      "role": "main",
      "soldOut": false,
      "bestSeller": false,
      "tag": "",
      "images": [
        "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501164754_nwsams0dq7xndrw3qody.png"
      ],
      "image": "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501164754_nwsams0dq7xndrw3qody.png",
      "url": "",
      "custom": true,
      "createdAt": "2026-07-01T08:05:37.106Z",
      "recipients": [
        "mom",
        "friend",
        "self",
        "kid"
      ]
    },
    {
      "id": 1791893767590,
      "name": "Хос аяга",
      "price": 75000,
      "oldPrice": null,
      "category": "cup",
      "role": "main",
      "soldOut": false,
      "bestSeller": false,
      "tag": "хос аяга",
      "images": [
        "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501169690_cc9ifpgleu3s6xcg8dbg.png"
      ],
      "image": "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501169690_cc9ifpgleu3s6xcg8dbg.png",
      "url": "",
      "custom": true,
      "createdAt": "2026-07-01T08:16:07.590Z",
      "recipients": [
        "partner"
      ]
    },
    {
      "id": 1791895108102,
      "name": "Never stop dreaming",
      "price": 52000,
      "oldPrice": null,
      "category": "cup",
      "role": "main",
      "soldOut": false,
      "bestSeller": false,
      "tag": "",
      "images": [
        "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501173690_xuddrutxlmxlleutvopb.png"
      ],
      "image": "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501173690_xuddrutxlmxlleutvopb.png",
      "url": "",
      "custom": true,
      "createdAt": "2026-07-01T08:38:28.102Z",
      "recipients": [
        "partner",
        "friend",
        "self",
        "kid"
      ]
    },
    {
      "id": 1791989888818,
      "name": "Wish you (цагаан)",
      "price": 34000,
      "oldPrice": null,
      "category": "cup",
      "role": "main",
      "soldOut": false,
      "bestSeller": false,
      "tag": "",
      "images": [
        "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501177702_szf3rhjylsl1x8cernud.png"
      ],
      "image": "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501177702_szf3rhjylsl1x8cernud.png",
      "url": "",
      "custom": true,
      "createdAt": "2026-07-02T10:58:08.818Z",
      "recipients": [
        "partner",
        "friend",
        "self",
        "kid"
      ]
    },
    {
      "id": 1791990689965,
      "name": "Hello kitty аяга",
      "price": 23000,
      "oldPrice": null,
      "category": "cup",
      "role": "main",
      "soldOut": false,
      "bestSeller": false,
      "tag": "",
      "images": [
        "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501182715_mckcdhlfxmaewrcgy4ym.png"
      ],
      "image": "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501182715_mckcdhlfxmaewrcgy4ym.png",
      "url": "",
      "custom": true,
      "createdAt": "2026-07-02T11:11:29.965Z",
      "recipients": [
        "partner",
        "friend",
        "self",
        "kid"
      ]
    },
    {
      "id": 1792045508838,
      "name": "Бариул дээрээ мууртай аяга (цэнхэр)",
      "price": 36000,
      "oldPrice": null,
      "category": "cup",
      "role": "main",
      "soldOut": false,
      "bestSeller": false,
      "tag": "",
      "images": [
        "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501186661_bmlm5wxiis8hwzwipdgr.png"
      ],
      "image": "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501186661_bmlm5wxiis8hwzwipdgr.png",
      "url": "",
      "custom": true,
      "createdAt": "2026-07-03T02:25:08.838Z",
      "recipients": [
        "mom",
        "partner",
        "friend",
        "self",
        "kid"
      ]
    },
    {
      "id": 1792045565481,
      "name": "Тавагтай аяга (панда)",
      "price": 40000,
      "oldPrice": null,
      "category": "cup",
      "role": "main",
      "soldOut": false,
      "bestSeller": false,
      "tag": "",
      "images": [
        "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501190678_tyrmryafk2wyb91i8ira.png"
      ],
      "image": "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501190678_tyrmryafk2wyb91i8ira.png",
      "url": "",
      "custom": true,
      "createdAt": "2026-07-03T02:26:05.481Z",
      "recipients": [
        "mom",
        "friend",
        "self",
        "kid"
      ]
    },
    {
      "id": 1792045762978,
      "name": "Dream мууртай аяга",
      "price": 34000,
      "oldPrice": null,
      "category": "cup",
      "role": "main",
      "soldOut": false,
      "bestSeller": false,
      "tag": "",
      "images": [
        "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501194694_klzzqe67nz1palseyonb.png"
      ],
      "image": "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501194694_klzzqe67nz1palseyonb.png",
      "url": "",
      "custom": true,
      "createdAt": "2026-07-03T02:29:22.978Z",
      "recipients": [
        "friend",
        "self",
        "kid"
      ]
    },
    {
      "id": 1792045811605,
      "name": "Зөгийтэй аяга (ягаан)",
      "price": 34000,
      "oldPrice": null,
      "category": "cup",
      "role": "main",
      "soldOut": false,
      "bestSeller": false,
      "tag": "",
      "images": [
        "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501198672_jt5w8v4nuonevmbguhrs.png"
      ],
      "image": "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501198672_jt5w8v4nuonevmbguhrs.png",
      "url": "",
      "custom": true,
      "createdAt": "2026-07-03T02:30:11.605Z",
      "recipients": [
        "mom",
        "friend",
        "self",
        "kid"
      ]
    },
    {
      "id": 1792046012726,
      "name": "Hello kitty аяга",
      "price": 23000,
      "oldPrice": null,
      "category": "cup",
      "role": "main",
      "soldOut": false,
      "bestSeller": false,
      "tag": "",
      "images": [
        "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501202704_wf8ftfuzdengbyzkl4me.png"
      ],
      "image": "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501202704_wf8ftfuzdengbyzkl4me.png",
      "url": "",
      "custom": true,
      "createdAt": "2026-07-03T02:33:32.726Z",
      "recipients": [
        "partner",
        "friend",
        "self",
        "kid"
      ]
    },
    {
      "id": 1792048313910,
      "name": "Бариул дээрээ мууртай аяга (ягаан)",
      "price": 36000,
      "oldPrice": null,
      "category": "cup",
      "role": "main",
      "soldOut": false,
      "bestSeller": false,
      "tag": "",
      "images": [
        "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501207694_kxzhu9myzwj77sk55pmw.png"
      ],
      "image": "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501207694_kxzhu9myzwj77sk55pmw.png",
      "url": "",
      "custom": true,
      "createdAt": "2026-07-03T03:11:53.910Z",
      "recipients": [
        "mom",
        "friend",
        "self",
        "kid"
      ]
    },
    {
      "id": 1792049123902,
      "name": "Урт бариултай аяга (цэнхэр)",
      "price": 26000,
      "oldPrice": null,
      "category": "cup",
      "role": "main",
      "soldOut": false,
      "bestSeller": false,
      "tag": "",
      "images": [
        "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501211685_ton28rqscwjujqwa3zas.png"
      ],
      "image": "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501211685_ton28rqscwjujqwa3zas.png",
      "url": "",
      "custom": true,
      "createdAt": "2026-07-03T03:25:23.902Z",
      "recipients": [
        "friend",
        "self",
        "kid"
      ]
    },
    {
      "id": 1792049153116,
      "name": "Урт бариултай аяга (улаан)",
      "price": 26000,
      "oldPrice": null,
      "category": "cup",
      "role": "main",
      "soldOut": false,
      "bestSeller": false,
      "tag": "",
      "images": [
        "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501215663_jxjiruw3rwbnvwyg7gts.png"
      ],
      "image": "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501215663_jxjiruw3rwbnvwyg7gts.png",
      "url": "",
      "custom": true,
      "createdAt": "2026-07-03T03:25:53.116Z",
      "recipients": [
        "friend",
        "self",
        "kid"
      ]
    },
    {
      "id": 1792049181895,
      "name": "Урт бариултай аяга (хар)",
      "price": 26000,
      "oldPrice": null,
      "category": "cup",
      "role": "main",
      "soldOut": false,
      "bestSeller": false,
      "tag": "",
      "images": [
        "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501220312_eknufc7smjudr1i9fwen.png"
      ],
      "image": "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501220312_eknufc7smjudr1i9fwen.png",
      "url": "",
      "custom": true,
      "createdAt": "2026-07-03T03:26:21.895Z",
      "recipients": [
        "friend",
        "self",
        "kid"
      ]
    },
    {
      "id": 1792049631583,
      "name": "Хөлтэй аяга (бор)",
      "price": 32000,
      "oldPrice": null,
      "category": "cup",
      "role": "main",
      "soldOut": false,
      "bestSeller": false,
      "tag": "",
      "images": [
        "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501224666_suielc4btb9t5anjbahg.png"
      ],
      "image": "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501224666_suielc4btb9t5anjbahg.png",
      "url": "",
      "custom": true,
      "createdAt": "2026-07-03T03:33:51.584Z",
      "recipients": [
        "mom",
        "friend",
        "self",
        "kid"
      ]
    },
    {
      "id": 1792049666800,
      "name": "Хөлтэй аяга (шар)",
      "price": 32000,
      "oldPrice": null,
      "category": "cup",
      "role": "main",
      "soldOut": false,
      "bestSeller": false,
      "tag": "",
      "images": [
        "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501228670_krc22kqzws00yslinbez.png"
      ],
      "image": "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501228670_krc22kqzws00yslinbez.png",
      "url": "",
      "custom": true,
      "createdAt": "2026-07-03T03:34:26.800Z",
      "recipients": [
        "mom",
        "friend",
        "self",
        "kid"
      ]
    },
    {
      "id": 1792049729772,
      "name": "Happy birthday аяга",
      "price": 38000,
      "oldPrice": null,
      "category": "cup",
      "role": "main",
      "soldOut": false,
      "bestSeller": false,
      "tag": "",
      "images": [
        "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501233802_s7ixh3z4ulqy512opir8.png"
      ],
      "image": "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501233802_s7ixh3z4ulqy512opir8.png",
      "url": "",
      "custom": true,
      "createdAt": "2026-07-03T03:35:29.772Z",
      "recipients": [
        "mom",
        "partner",
        "friend",
        "kid"
      ]
    },
    {
      "id": 1792050012637,
      "name": "Зөгийтэй аяга (шар)",
      "price": 34000,
      "oldPrice": null,
      "category": "cup",
      "role": "main",
      "soldOut": false,
      "bestSeller": false,
      "tag": "",
      "images": [
        "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501240969_djz9c62rxr0sxurtecwd.png"
      ],
      "image": "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501240969_djz9c62rxr0sxurtecwd.png",
      "url": "",
      "custom": true,
      "createdAt": "2026-07-03T03:40:12.637Z",
      "recipients": [
        "mom",
        "friend",
        "self",
        "kid"
      ]
    },
    {
      "id": 1792051141125,
      "name": "Үүлэн зүрхтэй аяга (цэнхэр)",
      "price": 32000,
      "oldPrice": null,
      "category": "cup",
      "role": "main",
      "soldOut": false,
      "bestSeller": false,
      "tag": "",
      "images": [
        "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501244833_me6nzwckpfwfutp4nf9j.png"
      ],
      "image": "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501244833_me6nzwckpfwfutp4nf9j.png",
      "url": "",
      "custom": true,
      "createdAt": "2026-07-03T03:59:01.125Z",
      "recipients": [
        "mom",
        "partner",
        "friend",
        "self"
      ]
    },
    {
      "id": 1792051407951,
      "name": "Үүлэн зүрхтэй аяга (ягаан)",
      "price": 32000,
      "oldPrice": null,
      "category": "cup",
      "role": "main",
      "soldOut": false,
      "bestSeller": false,
      "tag": "",
      "images": [
        "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501249674_udd3vkhda6dl5qhmlsgx.png"
      ],
      "image": "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501249674_udd3vkhda6dl5qhmlsgx.png",
      "url": "",
      "custom": true,
      "createdAt": "2026-07-03T04:03:27.951Z",
      "recipients": [
        "partner",
        "friend",
        "self"
      ]
    },
    {
      "id": 1792051664185,
      "name": "Cute cat (цагаан)",
      "price": 34000,
      "oldPrice": null,
      "category": "cup",
      "role": "main",
      "soldOut": false,
      "bestSeller": false,
      "tag": "",
      "images": [
        "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501253704_psisonmldfod6l9v7b37.png"
      ],
      "image": "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501253704_psisonmldfod6l9v7b37.png",
      "url": "",
      "custom": true,
      "createdAt": "2026-07-03T04:07:44.185Z",
      "recipients": [
        "partner",
        "friend",
        "self",
        "kid"
      ]
    },
    {
      "id": 1792054785749,
      "name": "Drink more water (цагаан)",
      "price": 23000,
      "oldPrice": null,
      "category": "cup",
      "role": "main",
      "soldOut": false,
      "bestSeller": true,
      "tag": "",
      "images": [
        "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501257712_b4cxly9aiepgjvuctnk8.png"
      ],
      "image": "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501257712_b4cxly9aiepgjvuctnk8.png",
      "url": "",
      "custom": true,
      "createdAt": "2026-07-03T04:59:45.749Z",
      "recipients": [
        "mom",
        "partner",
        "friend",
        "self",
        "kid"
      ]
    },
    {
      "id": 1792055523209,
      "name": "Drink more water (хар)",
      "price": 23000,
      "oldPrice": null,
      "category": "cup",
      "role": "main",
      "soldOut": false,
      "bestSeller": true,
      "tag": "",
      "images": [
        "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501263695_tzokmgdmhy5ggce42bay.png"
      ],
      "image": "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501263695_tzokmgdmhy5ggce42bay.png",
      "url": "",
      "custom": true,
      "createdAt": "2026-07-03T05:12:03.209Z",
      "recipients": [
        "mom",
        "partner",
        "friend",
        "self",
        "kid"
      ]
    },
    {
      "id": 1792060267782,
      "name": "Тавагтай аяга (шар цэцэгтэй)",
      "price": 32000,
      "oldPrice": null,
      "category": "cup",
      "role": "main",
      "soldOut": false,
      "bestSeller": false,
      "tag": "",
      "images": [
        "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501267660_lhsctxfkgjpmww2c3yp6.png"
      ],
      "image": "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501267660_lhsctxfkgjpmww2c3yp6.png",
      "url": "",
      "custom": true,
      "createdAt": "2026-07-03T06:31:07.782Z",
      "recipients": [
        "mom",
        "friend",
        "self",
        "kid"
      ]
    },
    {
      "id": 1792062193727,
      "name": "Тавагтай аяга (shiba)",
      "price": 40000,
      "oldPrice": null,
      "category": "cup",
      "role": "main",
      "soldOut": false,
      "bestSeller": false,
      "tag": "",
      "images": [
        "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501272681_fsfyaj4szlhpq9zetcnz.png"
      ],
      "image": "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501272681_fsfyaj4szlhpq9zetcnz.png",
      "url": "",
      "custom": true,
      "createdAt": "2026-07-03T07:03:13.727Z",
      "recipients": [
        "mom",
        "friend",
        "self",
        "kid"
      ]
    },
    {
      "id": 1792394134883,
      "name": "Лонх",
      "price": 20000,
      "oldPrice": null,
      "category": "cat1783328165806",
      "role": "main",
      "soldOut": false,
      "bestSeller": false,
      "tag": "",
      "images": [
        "https://res.cloudinary.com/dvpcihtou/image/upload/v1783394099/h4c8hnzwy37ehgoqkj8m.png",
        "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501282969_fengvojrfsfjobhmuvuf.png"
      ],
      "image": "https://res.cloudinary.com/dvpcihtou/image/upload/v1783394099/h4c8hnzwy37ehgoqkj8m.png",
      "url": "",
      "custom": true,
      "createdAt": "2026-07-07T03:15:34.883Z",
      "recipients": [
        "partner"
      ]
    },
    {
      "id": 1793447646285,
      "name": "Наранцэцэгийн баглаа",
      "price": 50000,
      "oldPrice": null,
      "category": "flower",
      "role": "main",
      "soldOut": false,
      "bestSeller": false,
      "tag": "",
      "images": [
        "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1784447584348_IMG_7245.jpeg"
      ],
      "image": "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1784447584348_IMG_7245.jpeg",
      "url": "",
      "custom": true,
      "createdAt": "2026-07-19T07:54:06.285Z",
      "recipients": [
        "mom",
        "partner",
        "friend",
        "self"
      ]
    },
    {
      "id": 1793447705574,
      "name": "Мини улбар сарнайтай баглаа",
      "price": 25000,
      "oldPrice": null,
      "category": "flower",
      "role": "main",
      "soldOut": false,
      "bestSeller": false,
      "tag": "",
      "images": [
        "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1784447700326_IMG_7249.jpeg"
      ],
      "image": "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1784447700326_IMG_7249.jpeg",
      "url": "",
      "custom": true,
      "createdAt": "2026-07-19T07:55:05.574Z",
      "recipients": [
        "mom",
        "partner",
        "friend",
        "self",
        "kid"
      ]
    },
    {
      "id": 1793447747234,
      "name": "Зэрлэг сарнайн баглаа",
      "price": 42000,
      "oldPrice": null,
      "category": "flower",
      "role": "main",
      "soldOut": false,
      "bestSeller": false,
      "tag": "",
      "images": [
        "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1784447763848_IMG_7251.jpeg"
      ],
      "image": "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1784447763848_IMG_7251.jpeg",
      "url": "",
      "custom": true,
      "createdAt": "2026-07-19T07:55:47.235Z",
      "recipients": [
        "mom",
        "partner",
        "friend",
        "self",
        "kid"
      ]
    },
    {
      "id": 1793447852263,
      "name": "Lily цэцгийн баглаа",
      "price": 60000,
      "oldPrice": null,
      "category": "flower",
      "role": "main",
      "soldOut": false,
      "bestSeller": false,
      "tag": "",
      "images": [
        "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1784447834209_IMG_7252.jpeg"
      ],
      "image": "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1784447834209_IMG_7252.jpeg",
      "url": "",
      "custom": true,
      "createdAt": "2026-07-19T07:57:32.263Z",
      "recipients": [
        "mom",
        "friend",
        "self",
        "kid"
      ]
    },
    {
      "id": 1793447984538,
      "name": "Мини сарнайн баглаа",
      "price": 47500,
      "oldPrice": null,
      "category": "flower",
      "role": "main",
      "soldOut": false,
      "bestSeller": false,
      "tag": "",
      "images": [
        "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1784447977946_IMG_7258.jpeg"
      ],
      "image": "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1784447977946_IMG_7258.jpeg",
      "url": "",
      "custom": true,
      "createdAt": "2026-07-19T07:59:44.538Z",
      "recipients": [
        "mom",
        "partner",
        "friend",
        "self",
        "kid"
      ]
    },
    {
      "id": 1793448023360,
      "name": "Мини ягаан сарнайн баглаа",
      "price": 47500,
      "oldPrice": null,
      "category": "flower",
      "role": "main",
      "soldOut": false,
      "bestSeller": false,
      "tag": "",
      "images": [
        "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1784448019332_IMG_7261.jpeg"
      ],
      "image": "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1784448019332_IMG_7261.jpeg",
      "url": "",
      "custom": true,
      "createdAt": "2026-07-19T08:00:23.360Z",
      "recipients": [
        "mom",
        "partner",
        "friend",
        "self",
        "kid"
      ]
    },
    {
      "id": 1793448083741,
      "name": "Хонин нүдэн цэцгийн баглаа",
      "price": 55000,
      "oldPrice": null,
      "category": "flower",
      "role": "main",
      "soldOut": false,
      "bestSeller": false,
      "tag": "",
      "images": [
        "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1784448073553_IMG_7270.jpeg"
      ],
      "image": "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1784448073553_IMG_7270.jpeg",
      "url": "",
      "custom": true,
      "createdAt": "2026-07-19T08:01:23.741Z",
      "recipients": [
        "mom",
        "partner",
        "friend",
        "self",
        "kid"
      ]
    }
  ],
  "overrides": {
    "148000": {
      "role": "main",
      "name": "Open when дугтуйны багц",
      "price": 25000,
      "oldPrice": null,
      "category": "cat1783328165806",
      "soldOut": false,
      "bestSeller": true,
      "images": [
        "https://cdn.zochil.shop/f684efaa-2a46-465b-bfca-b2535aab8b37_t1500.png"
      ],
      "image": "https://cdn.zochil.shop/f684efaa-2a46-465b-bfca-b2535aab8b37_t1500.png",
      "url": "https://zuvhuntuund.com/products/50890/148000",
      "recipients": [
        "partner",
        "self"
      ]
    },
    "150174": {
      "role": "main",
      "category": "cat1783328165806"
    },
    "300844": {
      "hidden": false
    },
    "304688": {
      "hidden": true
    },
    "400567": {
      "role": "main",
      "category": "cat1783328165806"
    },
    "400570": {
      "role": "main",
      "category": "cat1783328165806"
    },
    "422030": {
      "category": "cat1783328165806",
      "role": "main"
    },
    "423064": {
      "role": "main",
      "name": "Хайрын купон цулгай",
      "price": 12000,
      "oldPrice": null,
      "category": "cat1783328165806",
      "soldOut": false,
      "bestSeller": false,
      "images": [
        "https://cdn.zochil.shop/791599ac-64aa-4300-b663-24254d82e36c_t1500.jpg"
      ],
      "image": "https://cdn.zochil.shop/791599ac-64aa-4300-b663-24254d82e36c_t1500.jpg",
      "url": "https://zuvhuntuund.com/products/50890/423064",
      "recipients": [
        "mom",
        "partner",
        "self"
      ]
    },
    "424683": {
      "name": "Drink more water хос аяга",
      "price": 45000,
      "oldPrice": null,
      "category": "cup",
      "role": "main",
      "soldOut": false,
      "bestSeller": false,
      "images": [
        "https://cdn.zochil.shop/23b0396e-79c4-4074-8217-efd63ba4c33a_t1500.jpg"
      ],
      "image": "https://cdn.zochil.shop/23b0396e-79c4-4074-8217-efd63ba4c33a_t1500.jpg",
      "url": "https://zuvhuntuund.com/products/97467/424683",
      "recipients": [
        "partner",
        "friend",
        "self"
      ]
    },
    "424685": {
      "name": " Warm heart аяга (ногоон)",
      "price": 32000,
      "oldPrice": null,
      "category": "cup",
      "role": "main",
      "soldOut": false,
      "bestSeller": false,
      "images": [
        "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783500974815_ktoci92lydrvuogyaziq.png"
      ],
      "image": "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783500974815_ktoci92lydrvuogyaziq.png",
      "url": "https://zuvhuntuund.com/products/97467/424685",
      "recipients": [
        "mom",
        "partner",
        "friend"
      ]
    },
    "424714": {
      "name": "Dino цэнхэр",
      "price": 34000,
      "oldPrice": null,
      "category": "cup",
      "role": "main",
      "soldOut": false,
      "bestSeller": false,
      "images": [
        "https://res.cloudinary.com/dvpcihtou/image/upload/v1782899981/r8zczqdsnbsymrznoi4g.png",
        "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783500981969_fahfw9kzfwyn7vmyi0m4.png"
      ],
      "image": "https://res.cloudinary.com/dvpcihtou/image/upload/v1782899981/r8zczqdsnbsymrznoi4g.png",
      "url": "https://zuvhuntuund.com/products/97467/424714",
      "recipients": [
        "partner",
        "friend",
        "kid"
      ]
    },
    "424715": {
      "name": "Dino ягаан",
      "price": 34000,
      "oldPrice": null,
      "category": "cup",
      "role": "main",
      "soldOut": false,
      "bestSeller": false,
      "images": [
        "https://res.cloudinary.com/dvpcihtou/image/upload/v1783060406/emrbzjtyhzewnipj7tp1.png",
        "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783500989155_phkrzslv3a6ihghlk2nl.png"
      ],
      "image": "https://res.cloudinary.com/dvpcihtou/image/upload/v1783060406/emrbzjtyhzewnipj7tp1.png",
      "url": "https://zuvhuntuund.com/products/97467/424715",
      "recipients": [
        "mom",
        "partner",
        "friend",
        "self",
        "kid"
      ]
    },
    "424719": {
      "name": " Бариул дээрээ мууртай аяга (ногоон)",
      "price": 36000,
      "oldPrice": null,
      "category": "cup",
      "role": "main",
      "soldOut": false,
      "bestSeller": false,
      "images": [
        "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783500992736_xqkpbawcjd86krptxzgt.png"
      ],
      "image": "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783500992736_xqkpbawcjd86krptxzgt.png",
      "url": "https://zuvhuntuund.com/products/97467/424719",
      "recipients": [
        "mom",
        "friend",
        "self",
        "kid"
      ]
    },
    "424760": {
      "name": "Mrs. Pot and Chip",
      "price": 108000,
      "oldPrice": null,
      "category": "cup",
      "role": "main",
      "soldOut": false,
      "bestSeller": false,
      "images": [
        "https://res.cloudinary.com/dvpcihtou/image/upload/v1783053152/ajndk2we5tjdvvyntlnz.png",
        "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501000315_ylwwbg8vbjk9bncx54dl.png"
      ],
      "image": "https://res.cloudinary.com/dvpcihtou/image/upload/v1783053152/ajndk2we5tjdvvyntlnz.png",
      "url": "https://zuvhuntuund.com/products/97467/424760",
      "recipients": [
        "mom",
        "partner",
        "friend",
        "self"
      ]
    },
    "425004": {
      "name": "Тооройтой аяга",
      "price": 38000,
      "oldPrice": null,
      "category": "cup",
      "role": "main",
      "soldOut": false,
      "bestSeller": true,
      "images": [
        "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501003707_eyrhrcg7f6huomonicbn.png"
      ],
      "image": "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501003707_eyrhrcg7f6huomonicbn.png",
      "url": "https://zuvhuntuund.com/products/97467/425004",
      "recipients": [
        "friend",
        "self",
        "kid"
      ]
    },
    "426839": {
      "name": "Бэлгийн хайрцаг 20*20",
      "price": 6000,
      "oldPrice": null,
      "category": "box",
      "role": "container",
      "soldOut": false,
      "bestSeller": false,
      "images": [
        "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501007788_rnhvedtijr19nits2jf8.jpg"
      ],
      "image": "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501007788_rnhvedtijr19nits2jf8.jpg",
      "url": "https://zuvhuntuund.com/products/50890/426839",
      "recipients": [
        "mom",
        "partner",
        "friend",
        "self",
        "kid"
      ]
    },
    "426840": {
      "name": "Бэлгийн хайрцаг 25*25",
      "price": 8000,
      "oldPrice": null,
      "category": "box",
      "role": "container",
      "soldOut": false,
      "bestSeller": false,
      "images": [
        "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501011065_pxxv25k7wjupd9nuihl6.jpg"
      ],
      "image": "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501011065_pxxv25k7wjupd9nuihl6.jpg",
      "url": "https://zuvhuntuund.com/products/50890",
      "recipients": [
        "mom",
        "partner",
        "friend",
        "self",
        "kid"
      ]
    },
    "434516": {
      "role": "main",
      "category": "cat1783328165806"
    },
    "450487": {
      "name": "One piece SABO аяга таваг",
      "price": 43000,
      "oldPrice": null,
      "category": "cup",
      "role": "main",
      "soldOut": false,
      "bestSeller": false,
      "images": [
        "https://res.cloudinary.com/dvpcihtou/image/upload/v1782906271/ioh2ha9zumzapiq1duas.png",
        "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501018799_dgm6eg9jq30swsnc3jkf.png"
      ],
      "image": "https://res.cloudinary.com/dvpcihtou/image/upload/v1782906271/ioh2ha9zumzapiq1duas.png",
      "url": "https://zuvhuntuund.com/products/97467/450487",
      "recipients": [
        "partner",
        "friend",
        "self",
        "kid"
      ]
    },
    "554516": {
      "role": "main",
      "hidden": true
    },
    "562611": {
      "name": "Van Gogh cup",
      "price": 52000,
      "oldPrice": null,
      "category": "cup",
      "role": "main",
      "soldOut": false,
      "bestSeller": false,
      "images": [
        "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501023678_mgh9cnyh9pg9x0gzal7s.png"
      ],
      "image": "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501023678_mgh9cnyh9pg9x0gzal7s.png",
      "url": "https://zuvhuntuund.com/products/97467/562611",
      "recipients": [
        "mom",
        "friend",
        "self"
      ]
    },
    "562615": {
      "hidden": true
    },
    "562618": {
      "hidden": true
    },
    "562619": {
      "name": "Бантиктай аяга (нил ягаан)",
      "price": 40000,
      "oldPrice": null,
      "category": "cup",
      "role": "main",
      "soldOut": false,
      "bestSeller": false,
      "images": [
        "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501027734_ee6dfsfylujoylrnatcp.png"
      ],
      "image": "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501027734_ee6dfsfylujoylrnatcp.png",
      "url": "https://zuvhuntuund.com/products/97467/562619",
      "recipients": [
        "mom",
        "partner",
        "friend",
        "self"
      ]
    },
    "562621": {
      "name": "Girl with a Pearl Earring",
      "price": 52000,
      "oldPrice": null,
      "category": "cup",
      "role": "main",
      "soldOut": false,
      "bestSeller": false,
      "images": [
        "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501031803_x6uma6jcdqaxllnwumbm.png"
      ],
      "image": "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501031803_x6uma6jcdqaxllnwumbm.png",
      "url": "https://zuvhuntuund.com/products/97467/562621",
      "recipients": [
        "mom",
        "friend",
        "self"
      ]
    },
    "562705": {
      "name": "Кактус",
      "price": 23000,
      "oldPrice": null,
      "category": "cup",
      "role": "main",
      "soldOut": false,
      "bestSeller": false,
      "tag": "",
      "images": [
        "https://cdn.zochil.shop/e4c09caa-d19d-4e0d-bfe7-74dce3ee14ec_t1500.jpg"
      ],
      "image": "https://cdn.zochil.shop/e4c09caa-d19d-4e0d-bfe7-74dce3ee14ec_t1500.jpg",
      "url": "https://zuvhuntuund.com/products/97467/562705",
      "recipients": [
        "friend",
        "self",
        "rec1784786709046"
      ]
    },
    "726574": {
      "role": "main",
      "hidden": false,
      "name": "ME 2026",
      "price": 25000,
      "oldPrice": 45000,
      "category": "cat1783328165806",
      "soldOut": false,
      "bestSeller": false,
      "images": [
        "https://cdn.zochil.shop/a1c99302-6b11-40d5-a647-494a2c86689b_t1500.jpg",
        "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501036706_dwbk4zr04uv8ibp8jign.jpg"
      ],
      "image": "https://cdn.zochil.shop/a1c99302-6b11-40d5-a647-494a2c86689b_t1500.jpg",
      "url": "https://zuvhuntuund.com/products/50890/726574",
      "recipients": [
        "mom",
        "friend",
        "self"
      ]
    },
    "748641": {
      "role": "main",
      "soldOut": true,
      "hidden": true
    },
    "775947": {
      "name": "Alice wonderland cat",
      "price": 55000,
      "oldPrice": null,
      "category": "cup",
      "role": "main",
      "soldOut": false,
      "bestSeller": false,
      "images": [
        "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501040042_n7b9vuhs4nnfkkaxlquz.png"
      ],
      "image": "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501040042_n7b9vuhs4nnfkkaxlquz.png",
      "url": "https://zuvhuntuund.com/products/97467/775947",
      "recipients": [
        "friend",
        "kid"
      ]
    },
    "775952": {
      "hidden": true
    },
    "775967": {
      "name": "Pink pooh",
      "price": 54000,
      "oldPrice": null,
      "category": "cup",
      "role": "main",
      "soldOut": false,
      "bestSeller": false,
      "images": [
        "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501045728_ycysousk5dkvgz4ocizr.png"
      ],
      "image": "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501045728_ycysousk5dkvgz4ocizr.png",
      "url": "https://zuvhuntuund.com/products/97467/775967",
      "recipients": [
        "partner",
        "friend",
        "self",
        "kid"
      ]
    },
    "775986": {
      "name": "Dambo",
      "price": 58000,
      "oldPrice": null,
      "category": "cup",
      "role": "main",
      "soldOut": true,
      "bestSeller": false,
      "images": [
        "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501050095_xemlsynqccvmggb8khgp.png"
      ],
      "image": "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501050095_xemlsynqccvmggb8khgp.png",
      "url": "https://zuvhuntuund.com/products/97467/775986",
      "recipients": [
        "partner",
        "friend",
        "self",
        "kid"
      ]
    },
    "776004": {
      "name": "Evil queen аяга",
      "price": 58000,
      "oldPrice": null,
      "category": "cup",
      "role": "main",
      "soldOut": false,
      "bestSeller": false,
      "images": [
        "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501054993_pfje44tsbkd21qozuvj6.png"
      ],
      "image": "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501054993_pfje44tsbkd21qozuvj6.png",
      "url": "https://zuvhuntuund.com/products/97467/776004",
      "recipients": [
        "friend",
        "kid"
      ]
    },
    "776007": {
      "name": "Marie мууртай аяга",
      "price": 34000,
      "oldPrice": null,
      "category": "cup",
      "role": "main",
      "soldOut": false,
      "bestSeller": false,
      "image": "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501059678_oyxxfq8mbzwngoi2kiku.png",
      "url": "https://zuvhuntuund.com/products/97467/776007",
      "recipients": [
        "partner",
        "friend",
        "self"
      ]
    },
    "776012": {
      "name": "Harry Potter ном аяга",
      "price": 52000,
      "oldPrice": null,
      "category": "cup",
      "role": "main",
      "soldOut": false,
      "bestSeller": false,
      "images": [
        "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501064729_lr6hjds1mj9bcmeksoem.png"
      ],
      "image": "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501064729_lr6hjds1mj9bcmeksoem.png",
      "url": "https://zuvhuntuund.com/products/97467/776012",
      "recipients": [
        "partner",
        "friend",
        "self",
        "kid"
      ]
    },
    "776016": {
      "name": "Bee unique аяга",
      "price": 35000,
      "oldPrice": null,
      "category": "cup",
      "role": "main",
      "soldOut": false,
      "bestSeller": false,
      "images": [
        "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501068668_ydj0nyenkecf2rt3zaqe.png"
      ],
      "image": "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501068668_ydj0nyenkecf2rt3zaqe.png",
      "url": "https://zuvhuntuund.com/products/97467/776016",
      "recipients": [
        "partner",
        "friend",
        "self",
        "kid"
      ]
    },
    "776017": {
      "name": "Love dog аяга",
      "price": 37000,
      "oldPrice": null,
      "category": "cup",
      "role": "main",
      "soldOut": false,
      "bestSeller": false,
      "images": [
        "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501074231_aaawzb3kdvdm5ljtttbz.png"
      ],
      "image": "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501074231_aaawzb3kdvdm5ljtttbz.png",
      "url": "https://zuvhuntuund.com/products/97467/776017",
      "recipients": [
        "mom",
        "partner"
      ]
    },
    "776019": {
      "name": "Love аяга",
      "price": 33000,
      "oldPrice": null,
      "category": "cup",
      "role": "main",
      "soldOut": false,
      "bestSeller": false,
      "images": [
        "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501078708_r2smrwgqmrzaeyflorhc.png"
      ],
      "image": "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501078708_r2smrwgqmrzaeyflorhc.png",
      "url": "https://zuvhuntuund.com/products/97467/776019",
      "recipients": [
        "mom",
        "partner",
        "friend",
        "self"
      ]
    },
    "776022": {
      "name": "Бантиктай бариултай аяга (ягаан)",
      "price": 40000,
      "oldPrice": null,
      "category": "cup",
      "role": "main",
      "soldOut": false,
      "bestSeller": false,
      "images": [
        "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501082675_aiwdvrzyx1vqxceo8hzr.png"
      ],
      "image": "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501082675_aiwdvrzyx1vqxceo8hzr.png",
      "url": "https://zuvhuntuund.com/products/97467/776022",
      "recipients": [
        "mom",
        "partner",
        "friend",
        "self"
      ]
    },
    "776031": {
      "name": "Lilo Stitch хос аяга",
      "price": 75000,
      "oldPrice": null,
      "category": "cup",
      "role": "main",
      "soldOut": false,
      "bestSeller": false,
      "images": [
        "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501086686_wqkktuho2hybtz0iyruz.png"
      ],
      "image": "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501086686_wqkktuho2hybtz0iyruz.png",
      "url": "https://zuvhuntuund.com/products/97467/776031",
      "recipients": [
        "partner",
        "friend"
      ]
    },
    "776033": {
      "name": "Нохойтой аяга",
      "price": 39000,
      "oldPrice": null,
      "category": "cup",
      "role": "main",
      "soldOut": false,
      "bestSeller": false,
      "images": [
        "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501090721_bpbywaimhh5q997mpi4s.png"
      ],
      "image": "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501090721_bpbywaimhh5q997mpi4s.png",
      "url": "https://zuvhuntuund.com/products/97467/776033",
      "recipients": [
        "mom",
        "partner",
        "friend",
        "self",
        "kid"
      ]
    },
    "776038": {
      "name": "Zootopia үнэг, туулай хос аяга",
      "price": 68000,
      "oldPrice": null,
      "category": "cup",
      "role": "main",
      "soldOut": false,
      "bestSeller": false,
      "images": [
        "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501095672_z9byqtwngx6ajxy9c0p4.png"
      ],
      "image": "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501095672_z9byqtwngx6ajxy9c0p4.png",
      "url": "https://zuvhuntuund.com/products/97467/776038",
      "recipients": [
        "partner",
        "friend",
        "kid"
      ]
    },
    "776039": {
      "name": "One piece Chopper аяга таваг",
      "price": 43000,
      "oldPrice": null,
      "category": "cup",
      "role": "main",
      "soldOut": false,
      "bestSeller": false,
      "images": [
        "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501099675_sqaiwz9ohnshmoybsi4h.png"
      ],
      "image": "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501099675_sqaiwz9ohnshmoybsi4h.png",
      "url": "https://zuvhuntuund.com/products/97467/776039",
      "recipients": [
        "partner",
        "friend",
        "self",
        "kid"
      ]
    },
    "776042": {
      "name": "One piece Luffy аяга таваг",
      "price": 43000,
      "oldPrice": null,
      "category": "cup",
      "role": "main",
      "soldOut": false,
      "bestSeller": false,
      "images": [
        "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501103193_i0r9rdjsitxamgpi6ra1.png"
      ],
      "image": "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501103193_i0r9rdjsitxamgpi6ra1.png",
      "url": "https://zuvhuntuund.com/products/97467/776042",
      "recipients": [
        "partner",
        "friend",
        "self",
        "kid"
      ]
    },
    "776043": {
      "name": "One piece Asce аяга таваг",
      "price": 43000,
      "oldPrice": null,
      "category": "cup",
      "role": "main",
      "soldOut": false,
      "bestSeller": false,
      "images": [
        "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501106679_m7yccibk2decxerkdk5r.png"
      ],
      "image": "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501106679_m7yccibk2decxerkdk5r.png",
      "url": "https://zuvhuntuund.com/products/97467/776043",
      "recipients": [
        "partner",
        "friend",
        "self",
        "kid"
      ]
    },
    "776045": {
      "hidden": true
    },
    "776048": {
      "name": "Том тавагтай мууртай аяга (саарал)",
      "price": 40000,
      "oldPrice": null,
      "category": "cup",
      "role": "main",
      "soldOut": false,
      "bestSeller": false,
      "images": [
        "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501110981_pjivsq5cbjbo75gxso6p.png"
      ],
      "image": "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501110981_pjivsq5cbjbo75gxso6p.png",
      "url": "https://zuvhuntuund.com/products/97467/776048",
      "recipients": [
        "mom",
        "friend",
        "self",
        "kid"
      ]
    },
    "778896": {
      "name": "Butterfly аяга 3 өнгө",
      "price": 30000,
      "oldPrice": null,
      "category": "cup",
      "role": "main",
      "soldOut": false,
      "bestSeller": false,
      "images": [
        "https://res.cloudinary.com/dvpcihtou/image/upload/v1782897079/lvvh9ygxicyz58fsfbga.png",
        "https://res.cloudinary.com/dvpcihtou/image/upload/v1782897081/zbohgjbsfnvndur8uctd.png",
        "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501122756_gzjijq3ewq9pi0n7kblb.png"
      ],
      "image": "https://res.cloudinary.com/dvpcihtou/image/upload/v1782897079/lvvh9ygxicyz58fsfbga.png",
      "url": "https://zuvhuntuund.com/products/97467/778896",
      "recipients": [
        "friend",
        "self",
        "kid"
      ]
    },
    "778904": {
      "name": "Cute cat (ягаан)",
      "price": 34000,
      "oldPrice": null,
      "category": "cup",
      "role": "main",
      "soldOut": false,
      "bestSeller": false,
      "image": "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501126667_mrbygudb6fgv8cjeb1j7.png",
      "url": "https://zuvhuntuund.com/products/97467/778904",
      "recipients": [
        "friend",
        "self"
      ],
      "images": [
        "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501126667_mrbygudb6fgv8cjeb1j7.png"
      ]
    },
    "778914": {
      "name": "Cat tail",
      "price": 34000,
      "oldPrice": null,
      "category": "cup",
      "role": "main",
      "soldOut": false,
      "bestSeller": false,
      "image": "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501134037_uarn61wd0kklxpnatzbb.png",
      "url": "https://zuvhuntuund.com/products/97467/778914",
      "recipients": [
        "mom",
        "partner",
        "friend",
        "self"
      ]
    },
    "778920": {
      "name": "Туулайтай аяга (цагаан)",
      "price": 35000,
      "oldPrice": null,
      "category": "cup",
      "role": "main",
      "soldOut": false,
      "bestSeller": false,
      "images": [
        "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501140834_fi7vaacalbwrpkoz1mjv.png"
      ],
      "image": "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501140834_fi7vaacalbwrpkoz1mjv.png",
      "url": "https://zuvhuntuund.com/products/97467/778920",
      "recipients": [
        "partner",
        "friend",
        "self",
        "kid"
      ]
    },
    "809544": {
      "role": "main",
      "name": "To-do list",
      "price": 28000,
      "oldPrice": null,
      "category": "cat1783328165806",
      "soldOut": false,
      "bestSeller": false,
      "images": [
        "https://res.cloudinary.com/dvpcihtou/image/upload/v1782968446/mze2sqn2e2zs5z7xzgxs.jpg",
        "https://res.cloudinary.com/dvpcihtou/image/upload/v1782968452/rknjlnjy4lthtdolypal.jpg",
        "https://res.cloudinary.com/dvpcihtou/image/upload/v1782968456/ws3laudbizgii2e8zd4w.jpg",
        "https://raw.githubusercontent.com/enkhjin08-create/zt-site/main/images/uploads/1783501156661_dwqilfyvgwfiksompblt.jpg"
      ],
      "image": "https://res.cloudinary.com/dvpcihtou/image/upload/v1782968446/mze2sqn2e2zs5z7xzgxs.jpg",
      "url": "https://zuvhuntuund.com/products/50890/809544",
      "recipients": [
        "mom",
        "friend",
        "self"
      ]
    },
    "810061": {
      "hidden": true
    },
    "896537": {
      "name": "Наранцэцэг",
      "price": 15000,
      "oldPrice": null,
      "category": "flower",
      "role": "main",
      "soldOut": false,
      "bestSeller": false,
      "tag": "",
      "images": [
        "https://cdn.zochil.shop/7f89541f-1e35-4849-872f-9fc29099d03a_t1500.jpg"
      ],
      "image": "https://cdn.zochil.shop/7f89541f-1e35-4849-872f-9fc29099d03a_t1500.jpg",
      "url": "https://zuvhuntuund.com/products/331797/896537",
      "recipients": [
        "mom",
        "partner",
        "rec1784786709046"
      ]
    },
    "896539": {
      "soldOut": true
    },
    "896551": {
      "soldOut": false
    },
    "896579": {
      "soldOut": true
    },
    "896591": {
      "soldOut": true
    },
    "896593": {
      "soldOut": true
    },
    "896648": {
      "soldOut": true
    },
    "896651": {
      "soldOut": true
    },
    "897023": {
      "soldOut": true
    },
    "897024": {
      "name": "Шар мини сарнайтай баглаа",
      "price": 60000,
      "oldPrice": null,
      "category": "flower",
      "role": "main",
      "soldOut": false,
      "bestSeller": false,
      "tag": "",
      "images": [
        "https://cdn.zochil.shop/1236635a-8c7c-467c-be80-2665af6885a2_t1500.jpg"
      ],
      "image": "https://cdn.zochil.shop/1236635a-8c7c-467c-be80-2665af6885a2_t1500.jpg",
      "url": "https://zuvhuntuund.com/products/331797/897024",
      "recipients": [
        "mom",
        "partner",
        "self",
        "rec1784786709046"
      ]
    },
    "897063": {
      "soldOut": true
    },
    "897069": {
      "soldOut": true
    }
  },
  "categories": {
    "cat1783328165806": {
      "key": "cat1783328165806",
      "label": "Зөвхөн түүнд бүтээгдэхүүн",
      "color": "#FF6698",
      "tint": "#FFEAF1",
      "iconRef": "extra",
      "custom": true
    }
  },
  "recipients": {
    "rec1784786709046": {
      "key": "rec1784786709046",
      "label": "Аавдаа",
      "emoji": "🎁",
      "custom": true
    }
  },
  "recipientOverrides": {
    "kid": {
      "label": "Дүүдээ",
      "emoji": "🎈"
    }
  },
  "coupons": {
    "ZT2607": {
      "code": "ZT2607",
      "type": "percent",
      "value": 20,
      "active": true,
      "maxUses": null,
      "usedCount": 0,
      "expiresAt": "2026-07-09",
      "createdAt": "2026-07-06T09:20:42.919Z"
    }
  },
  "users": {}
};

const PAGEVIEWS = {
  "2026-07-24|category": 3,
  "2026-07-24|home": 26,
  "2026-07-24|builder": 8
};

exports.handler = async (event) => {
  const params = event.queryStringParameters || {};
  if(!checkPin(params.pin)) return json(401, { error: "Invalid PIN" });

  try{
    const mainStore = getStore(storeConfig("zt-data"));
    await mainStore.setJSON("main", MAIN_DOC);

    const pvStore = getStore(storeConfig("zt-pageviews"));
    await pvStore.setJSON("views", PAGEVIEWS);

    return json(200, {
      ok: true,
      migrated: {
        orders: MAIN_DOC.orders.length,
        products: MAIN_DOC.products.length,
        overrides: Object.keys(MAIN_DOC.overrides).length,
        categories: Object.keys(MAIN_DOC.categories).length,
        recipients: Object.keys(MAIN_DOC.recipients).length,
        coupons: Object.keys(MAIN_DOC.coupons).length,
        pageviewKeys: Object.keys(PAGEVIEWS).length
      },
      note: "Амжилттай! Одоо migrate.js файлыг GitHub-аас устгаж болно."
    });
  }catch(e){
    console.error("[migrate error]", e.message);
    return json(500, { error: "Шилжилт амжилтгүй: " + e.message });
  }
};
