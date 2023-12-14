const express = require('express');
const bodyParser = require('body-parser');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');
const multer = require('multer');
const fs = require('fs');

const app = express();
  const port = 3000;

const Page = fs.readFileSync('static/Page.html').toString();
  const upload = multer({ dest: 'uploads/' }); 
  app.use(bodyParser.json());
  app.use('/images', express.static('uploads'));

  let devices = [];
  let users = [];
  let currentDeviceId = 0;
  let currentUserId = 0;

  // Swagger опції
  const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Inventory API',
        version: '1.0.0',
      },
      tags: [
        {
          name: 'default',
          description: 'Загальні API',
        },
      ],
      components: {
        schemas: {
          Device: {
            type: 'object',
            properties: {
                id: {type:'integer', desription: 'id of device'},
              name: { type: 'string', description: 'Назва пристрою' },
              description: { type: 'string', description: 'Опис пристрою' },
              serialNumber: { type: 'string', description: 'Серійний номер пристрою' },
              manufacturer: { type: 'string', description: 'Виробник пристрою' },
            },
          },
          User: {
            type: 'object',
            properties: {
                id: {type:'integer', desription: 'id of device'},
              name: { type: 'string', description: 'Ім’я користувача' },
            },
          },
        },
      },
    },
    apis: ['main.js'],
  };

  const swaggerSpec = swaggerJSDoc(swaggerOptions);
  app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

/**
 * @swagger
 * /devices:
 *   get:
 *     summary: Отримати список всіх пристроїв.
 *     responses:
 *       200:
 *         description: Успішне отримання списку пристроїв.
 */

app.get('/devices', (req, res) => {
    res.json(devices);
});

/**
 * @swagger
 * /devices/{id}:
 *   get:
 *     summary: Отримати інформацію про пристрій за його ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID пристрою
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Успішне отримання інформації про пристрій.
 *       404:
 *         description: Прошутий пристрій не знайдено.
 */

app.get('/devices/:id', (req, res) => {
    const deviceId = req.params.deviceID;
    const device = devices.find(d => d.id === deviceId);

    if (!device) {
        return res.status(404).json({ error: 'Пристрій не знайдено' });
    }

    res.json(device);
});

/**
 * @swagger
 * /devices:
 *   post:
 *     summary: Створити новий пристрій.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Device'
 *     responses:
 *       200:
 *         description: Успішне створення нового пристрою.
 *       400:
 *         description: Помилка у введених даних або пристрій вже існує.
 */

app.post('/devices', (req, res) => {
    const newDevice = req.body;

    if (devices.some(device => device.name === newDevice.name)) {
        return res.status(400).json({ error: 'Пристрій з таким ім\'ям вже зареєстровано' });
    }

    newDevice.id = req.params.id;
    devices.push(newDevice);
    res.json(newDevice);
});

/**
 * @swagger
 * /devices/{id}:
 *   put:
 *     summary: Оновити інформацію про пристрій за його ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID пристрою
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Device'
 *     responses:
 *       200:
 *         description: Успішне оновлення інформації про пристрій.
 *       404:
 *         description: Прошутий пристрій не знайдено.
 */

app.put('/devices/:id', (req, res) => {
    const deviceId = req.params.deviceID;
    let updatedDevice = { ...req.body };
    const index = devices.findIndex(d => d.id === deviceId);

    if (index === -1) {
        return res.status(404).json({ error: 'Пристрій не знайдено' });
    }

    delete updatedDevice.id;

    updatedDevice = { ...devices[index], ...updatedDevice };

    devices[index] = updatedDevice;
    res.json(updatedDevice);
});

/**
 * @swagger
 * /devices/{id}:
 *   delete:
 *     summary: Видалити пристрій за його ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID пристрою
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Успішне видалення пристрою.
 *       404:
 *         description: Прошутий пристрій не знайдено.
 */

app.delete('/devices/:id', (req, res) => {
    const deviceId = req.params.deviceID;
    const index = devices.findIndex(d => d.id === deviceId);

    if (index === -1) {
        return res.status(404).json({ error: 'Пристрій не знайдено' });
    }

    devices.splice(index, 1);
    res.json({ message: 'Пристрій видалено успішно' });
});

/**
 * @swagger
 * /devices/{id}/image:
 *   put:
 *     summary: Завантажити зображення для пристрою за його ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID пристрою
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Успішне завантаження зображення.
 *       404:
 *         description: Прошутий пристрій не знайдено.
 */

app.put('/devices/:id/image', upload.single('image'), (req, res) => {
    var temp = devices.filter((obj) => obj.id == req.params.deviceID);

    if (temp.length == 0) {
        res.sendStatus(404);
    } else {
        temp[0].image_path = req.file.filename;
        res.sendStatus(200);
        res.json({ message: 'Зображення додано успішно!' });
    }
});

/**
 * @swagger
 * /devices/{id}/image:
 *   get:
 *     summary: Отримати зображення для пристрою за його ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID пристрою
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Успішне отримання зображення.
 *       404:
 *         description: Зображення не знайдено.
 */

app.get('/devices/:id/image', (req, res) => {
    var temp = devices.filter((obj) => obj.id == req.params.deviceID);

    if (temp.length == 0) {
        res.sendStatus(404);
    } else {
        if (temp[0].image_path != null) {
            res.send(Page.replace('{%image_path}', temp[0].image_path).replace('image_mimetype'));
        } else {
            res.sendStatus(404);
        }
    }
});

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Отримати список всіх користувачів.
 *     responses:
 *       200:
 *         description: Успішне отримання списку користувачів.
 */

app.get('/users', (req, res) => {
    res.json(users);
});

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Створити нового користувача.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Успішне створення нового користувача.
 *       400:
 *         description: Помилка у введених даних або користувач вже існує.
 */

app.post('/users', (req, res) => {
    const newUser = req.body;

    if (users.some(user => user.name === newUser.name)) {
        return res.status(400).json({ error: 'Користувач з таким ім\'ям вже зареєстровано' });
    }

    newUser.id = req.params.id;
    users.push(newUser);
    res.json(newUser);
});

/**
 * @swagger
 * /users/{id}/devices:
 *   get:
 *     summary: Отримати список пристроїв, які використовує користувач за його ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID користувача
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Успішне отримання списку пристроїв користувача.
 *       404:
 *         description: Користувач не знайдений.
 */

app.get('/users/:id/devices', (req, res) => {
    const userId = req.params.userID;

    const user = users.find(u => u.id === userId);

    if (!user) {
        return res.status(404).json({ error: 'Користувач не знайдений' });
    }

    const userDevices = user.devices || [];

    res.json(userDevices);
});

/**
 * @swagger
 * /devices/{id}/take:
 *   post:
 *     summary: Взяти пристрій у користування за його ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID пристрою
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: ID користувача, який бере пристрій у користування.
 *     responses:
 *       200:
 *         description: Успішне взяття пристрою у користування.
 *       404:
 *         description: Пристрій або користувач не знайдені.
 */

app.post('/devices/:id/take', (req, res) => {
    const deviceId = req.params.deviceID;
    const userId = req.body.userID;

    const device = devices.find(d => d.id === deviceId);
    const user = users.find(u => u.id === userId);

    if (!device || !user) {
        return res.status(404).json({ error: 'Пристрій або користувач не знайдені' });
    }

    device.assigned_to = "використовується";

    if (!user.devices) {
        user.devices = [];
    }
    user.devices.push(device);

    res.json({ message: 'Пристрій взято у користування!' });
});

/**
 * @swagger
 * /devices/{id}/return:
 *   post:
 *     summary: Повернення пристрою на зберігання за його ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID пристрою
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: ID користувача, який повертає пристрій.
 *     responses:
 *       200:
 *         description: Успішно повертає пристрій на зберігання.
 *       404:
 *         description: Пристрій або користувач не знайдені.
 */

app.post('/devices/:id/return', (req, res) => {
    const deviceId = req.params.deviceID;
    const userId = req.body.userID;

    const device = devices.find(d => d.id === deviceId);
    const user = users.find(u => u.id === userId);

    if (!device || !user) {
      return res.status(404).json({ error: 'Пристрій або користувач не знайдені' });
    }

    user.devices.splice(device, 1);

    device.assigned_to = "на зберіганні"
    // Логіка для повернення пристрою на зберігання
    res.json({ message: 'Пристрій повернено на зберіання!' });
  });

  // Запускаємо сервер
  app.listen(port, () => {
    console.log(`Сервер запущений на: http://localhost:${port}` + '/api-docs/')
  });




