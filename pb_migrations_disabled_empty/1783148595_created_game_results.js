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
        "id": "field_tldud3101gxx599",
        "max": 0,
        "min": 0,
        "name": "player",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": true,
        "system": false,
        "type": "text"
      },
      {
        "help": "",
        "hidden": false,
        "id": "field_w6z028kn9gj9giz",
        "maxSelect": 1,
        "name": "gameKey",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "select",
        "values": [
          "bingo",
          "quiz",
          "story",
          "elimination"
        ]
      },
      {
        "help": "",
        "hidden": false,
        "id": "field_nvh12zc9cqp2uyj",
        "maxSize": 2000000,
        "name": "answers",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "json"
      },
      {
        "help": "",
        "hidden": false,
        "id": "field_wzioey3jxr43dvn",
        "max": 100,
        "min": 0,
        "name": "score",
        "onlyInt": false,
        "presentable": false,
        "required": false,
        "system": false,
        "type": "number"
      },
      {
        "help": "",
        "hidden": false,
        "id": "field_sfg9uxsmgesc15z",
        "max": 100,
        "min": 0,
        "name": "maxScore",
        "onlyInt": false,
        "presentable": false,
        "required": true,
        "system": false,
        "type": "number"
      },
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "field_t18mu9okpwawlth",
        "max": 0,
        "min": 0,
        "name": "completedAt",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": true,
        "system": false,
        "type": "text"
      },
      {
        "help": "",
        "hidden": false,
        "id": "field_pending_bingo_score",
        "name": "pendingBingoScore",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "bool"
      },
      {
        "help": "",
        "hidden": false,
        "id": "field_quiz_session_index",
        "max": 4,
        "min": 0,
        "name": "quizSessionIndex",
        "onlyInt": false,
        "presentable": false,
        "required": false,
        "system": false,
        "type": "number"
      },
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "field_sector_key",
        "max": 80,
        "min": 0,
        "name": "sectorKey",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "field_sector_name",
        "max": 120,
        "min": 0,
        "name": "sectorName",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      }
    ],
    "id": "pbc_1576656701",
    "indexes": [],
    "listRule": "",
    "name": "game_results",
    "system": false,
    "type": "base",
    "updateRule": "",
    "viewRule": ""
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1576656701");

  return app.delete(collection);
})
