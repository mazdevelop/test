const http = require('http');

// ذخیره‌سازی موقت داده‌ها
let users = [
    { id: 1, name: "علی", email: "ali@example.com" },
    { id: 2, name: "مریم", email: "maryam@example.com" }
];

// پارس کردن داده‌های ورودی
const getRequestData = (req) => {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (error) {
                reject(error);
            }
        });
        req.on('error', (error) => {
            reject(error);
        });
    });
};

const server = http.createServer(async (req, res) => {
    // تنظیم هدرهای پاسخ
    res.setHeader('Content-Type', 'application/json');

    // استخراج مسیر و متد درخواست
    const url = new URL(req.url, `http://${req.headers.host}`);
    const path = url.pathname;
    const method = req.method;
    const id = path.split('/')[2];

    try {
        // GET /api/users - دریافت همه کاربران
        if (path === '/api/users' && method === 'GET') {
            res.writeHead(200);
            res.end(JSON.stringify({
                success: true,
                message: "لیست کاربران با موفقیت دریافت شد",
                data: users
            }));
        }

        // GET /api/users/:id - دریافت یک کاربر
        else if (path.match(/^\/api\/users\/\d+$/) && method === 'GET') {
            const user = users.find(u => u.id === parseInt(id));
            if (!user) {
                res.writeHead(404);
                res.end(JSON.stringify({
                    success: false,
                    message: "کاربر مورد نظر یافت نشد"
                }));
                return;
            }
            res.writeHead(200);
            res.end(JSON.stringify({
                success: true,
                message: "کاربر با موفقیت دریافت شد",
                data: user
            }));
        }

        // POST /api/users - ایجاد کاربر جدید
        else if (path === '/api/users' && method === 'POST') {
            const data = await getRequestData(req);
            const newUser = {
                id: users.length + 1,
                name: data.name,
                email: data.email
            };
            users.push(newUser);
            res.writeHead(201);
            res.end(JSON.stringify({
                success: true,
                message: "کاربر با موفقیت ایجاد شد",
                data: newUser
            }));
        }

        // PUT /api/users/:id - بروزرسانی کاربر
        else if (path.match(/^\/api\/users\/\d+$/) && method === 'PUT') {
            const user = users.find(u => u.id === parseInt(id));
            if (!user) {
                res.writeHead(404);
                res.end(JSON.stringify({
                    success: false,
                    message: "کاربر مورد نظر یافت نشد"
                }));
                return;
            }

            const data = await getRequestData(req);
            user.name = data.name || user.name;
            user.email = data.email || user.email;

            res.writeHead(200);
            res.end(JSON.stringify({
                success: true,
                message: "کاربر با موفقیت بروزرسانی شد",
                data: user
            }));
        }

        // DELETE /api/users/:id - حذف کاربر
        else if (path.match(/^\/api\/users\/\d+$/) && method === 'DELETE') {
            const userIndex = users.findIndex(u => u.id === parseInt(id));
            if (userIndex === -1) {
                res.writeHead(404);
                res.end(JSON.stringify({
                    success: false,
                    message: "کاربر مورد نظر یافت نشد"
                }));
                return;
            }

            users.splice(userIndex, 1);
            res.writeHead(200);
            res.end(JSON.stringify({
                success: true,
                message: "کاربر با موفقیت حذف شد"
            }));
        }

        // مسیر نامعتبر
        else {
            res.writeHead(404);
            res.end(JSON.stringify({
                success: false,
                message: "مسیر مورد نظر یافت نشد"
            }));
        }

    } catch (error) {
        // مدیریت خطاها
        res.writeHead(500);
        res.end(JSON.stringify({
            success: false,
            message: "خطای سرور رخ داده است",
            error: error.message
        }));
    }
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`سرور در پورت ${PORT} در حال اجرا است`);
});
