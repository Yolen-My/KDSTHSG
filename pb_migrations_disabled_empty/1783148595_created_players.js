/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "createRule": "",
    "deleteRule": "",
    "fields": [
      {
        "autogeneratePattern": "[a-z0-9]{15}",
        "help": "",
        "hidden": false,
        "id": "text3208210256",
        "max": 15,
        "min": 15,
        "name": "id",
        "pattern": "^[a-z0-9]+$",
        "presentable": false,
        "primaryKey": true,
        "required": true,
        "system": true,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "field_doql9loy45uk4dj",
        "max": 0,
        "min": 0,
        "name": "name",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": true,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "field_208nhdpxpbwzk94",
        "max": 0,
        "min": 0,
        "name": "phone",
        "pattern": "^1[3-9]\\d{9}$",
        "presentable": false,
        "primaryKey": false,
        "required": true,
        "system": false,
        "type": "text"
      },
      {
        "help": "",
        "hidden": false,
        "id": "field_morbrvao42bxogx",
        "maxSelect": 1,
        "name": "office",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "select",
        "values": [
          "北京",
          "上海",
          "深圳",
          "香港"
        ]
      },
      {
        "help": "",
        "hidden": false,
        "id": "field_ygbjayr77jgbj8p",
        "maxSelect": 1,
        "name": "team",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "select",
        "values": [
          "Alpha",
          "Beta",
          "Gamma",
          "Delta"
        ]
      },
      {
        "help": "",
        "hidden": false,
        "id": "field_ou8h3fsbl5ui96a",
        "max": 400,
        "min": 0,
        "name": "totalScore",
        "onlyInt": false,
        "presentable": false,
        "required": false,
        "system": false,
        "type": "number"
      },
      {
        "help": "",
        "hidden": false,
        "id": "field_tdqt91fdf8h37fi",
        "maxSize": 2000000,
        "name": "completedGames",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      },
      {
        "help": "",
        "hidden": false,
        "id": "field_nt9kegzg61u3blq",
        "name": "finalSubmitted",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "bool"
      },
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "field_3zmx21uvs3dgimq",
        "max": 0,
        "min": 0,
        "name": "finalCompletedAt",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      }
    ],
    "id": "pbc_3072146508",
    "indexes": [],
    "listRule": "",
    "name": "players",
    "system": false,
    "type": "base",
    "updateRule": "",
    "viewRule": ""
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3072146508");

  return app.delete(collection);
})
