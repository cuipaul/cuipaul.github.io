// js/db.js
const DB_NAME = 'MyPortfolioDB';
const DB_VERSION = 3;
let db = null;
let dbPromise = null;

// 初始化数据库
function initDB() {
    if (dbPromise) {
        return dbPromise;
    }
    
    dbPromise = new Promise((resolve, reject) => {
        console.log('开始初始化数据库...');
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            console.log('数据库版本更新');
            db = event.target.result;
            // 创建对象仓库（相当于表）
            if (!db.objectStoreNames.contains('posts')) {
                console.log('创建posts对象仓库');
                db.createObjectStore('posts', { keyPath: 'id', autoIncrement: true });
            }
            if (!db.objectStoreNames.contains('config')) {
                console.log('创建config对象仓库');
                db.createObjectStore('config', { keyPath: 'key' });
            }
            if (!db.objectStoreNames.contains('comments')) {
                console.log('创建comments对象仓库');
                db.createObjectStore('comments', { keyPath: 'id', autoIncrement: true });
            }
            if (!db.objectStoreNames.contains('images')) {
                console.log('创建images对象仓库');
                db.createObjectStore('images', { keyPath: 'id', autoIncrement: true });
            }
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            console.log('数据库连接成功:', db);
            resolve(db);
        };

        request.onerror = (event) => {
            console.error('数据库打开失败:', event.target.error);
            reject('数据库打开失败');
        };
    });
    
    return dbPromise;
}

// 通用增删改查封装
const DB = {
    // 确保数据库已连接
    async ensureConnected() {
        if (!db) {
            await initDB();
        }
        return db;
    },
    
    // 添加数据
    async add(storeName, data) {
        await this.ensureConnected();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.add(data);
            request.onsuccess = () => {
                console.log('添加数据成功:', data);
                resolve(request.result);
            };
            request.onerror = () => {
                console.error('添加数据失败:', request.error);
                reject(request.error);
            };
        });
    },
    
    // 获取所有数据
    async getAll(storeName) {
        await this.ensureConnected();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();
            request.onsuccess = () => {
                console.log('获取数据成功:', request.result);
                resolve(request.result);
            };
            request.onerror = () => {
                console.error('获取数据失败:', request.error);
                reject(request.error);
            };
        });
    },
    
    // 删除数据
    async delete(storeName, id) {
        await this.ensureConnected();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(id);
            request.onsuccess = () => {
                console.log('删除数据成功:', id);
                resolve();
            };
            request.onerror = () => {
                console.error('删除数据失败:', request.error);
                reject(request.error);
            };
        });
    },
    
    // 更新数据
    async put(storeName, data) {
        await this.ensureConnected();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);
            request.onsuccess = () => {
                console.log('更新数据成功:', data);
                resolve();
            };
            request.onerror = () => {
                console.error('更新数据失败:', request.error);
                reject(request.error);
            };
        });
    }
};

// 初始化数据库
console.log('DB模块加载完成');