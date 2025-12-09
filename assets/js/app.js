const whatttt = document.getElementById('whatttt');
const spinner = document.getElementById('spinner');
const load = document.getElementById('lode');
const start = document.getElementById('start');
const login = document.getElementById('login');
const nowstart = document.getElementById('nowstart');
const display = document.getElementById('display');
const titleTaskinput = document.getElementById('titletask');
const titledisinput = document.getElementById('taskDiscript');
const create2 = document.getElementById('create2');
const ask = document.getElementById('ask');
const adduserback = document.getElementById('addblur');
const create = document.getElementById('create');
const from = document.getElementById('from');

// چک اولیه برای عناصر (برای جلوگیری از null error)
if (display) display.classList.add('dis-hide');
if (load) load.classList.add('dis-hide');
if (start) start.classList.add('dis-hide');
if (login) login.classList.add('dis-hide');

if (nowstart) {
    nowstart.addEventListener('click', (e) => {
        const loader = document.querySelector('.loader');
        if (loader) loader.classList.remove('dis-hide');
        setTimeout(() => {
            const trantionUp = document.querySelector('.trantion_up');
            if (trantionUp) trantionUp.classList.add('dis-none');
            e.preventDefault();
        }, 3000);
        setTimeout(() => {
            const formSignin = document.querySelector('.form-signin');
            if (formSignin) formSignin.classList.remove('dis-hide');
        }, 3000);
    });
}

setTimeout(() => { if (load) load.classList.remove('dis-hide'); }, 1000);
setTimeout(() => { if (load) load.classList.add('dis-hide'); }, 4000);
setTimeout(() => { if (start) start.classList.remove('dis-hide'); }, 5000);

const send = document.getElementById('send');
if (send) {
    send.addEventListener('click', function (e) {
        e.preventDefault();
        const floatingInput = document.getElementById('floatingInput')?.value.trim() || '';
        const floatingPassword = document.getElementById('floatingPassword')?.value.trim() || '';
        const namalog = document.getElementById('namalog');
        if (namalog) namalog.innerHTML = `hi ${floatingInput}`;

        if (floatingInput !== '' && floatingInput.length > 3 && floatingPassword !== '' && floatingPassword.length >= 6 && /^\d+$/.test(floatingPassword)) {
            if (spinner) spinner.classList.remove('dis-hide');
            setTimeout(() => { if (login) login.classList.add('dis-hide'); }, 2000);
            setTimeout(() => { if (load) load.classList.remove('dis-hide'); }, 2000);
            setTimeout(() => { if (load) load.classList.add('dis-hide'); }, 4000);
            setTimeout(() => {
                if (whatttt) whatttt.classList.remove('dis-hide');
                checkEmptyTasks();
            }, 4000);
        } else {
            alert('Error!!');
        }
    });
}

let db;

window.onload = () => {
    let request = window.indexedDB.open('To do', 1);

    request.onerror = () => {
        console.log('DataBase Failed to Open');
    };

    request.onsuccess = () => {
        console.log('DataBase Opened Successfully');
        db = request.result;
        displayData(); // لود اولیه taskها از DB
    };

    request.onupgradeneeded = (e) => {
        let db = e.target.result;
        let objectStore = db.createObjectStore('To do', {
            keyPath: 'id',
            autoIncrement: true
        });
        objectStore.createIndex('Title', 'Title', { unique: false });
        objectStore.createIndex('Body', 'Body', { unique: false });
        console.log('DataBase setup Successfully');
    };
};

const addData = (e, callback) => {
    e.preventDefault();

    let newitem = {
        Title: titleTaskinput.value,
        Body: titledisinput.value
    };

    let transaction = db.transaction(['To do'], 'readwrite');
    let objectStore = transaction.objectStore('To do');
    let request = objectStore.add(newitem);

    request.onsuccess = () => {
        if (titleTaskinput) titleTaskinput.value = '';
        if (titledisinput) titledisinput.value = '';
        console.log('Item added to DB');
    };

    transaction.oncomplete = () => {
        console.log('Transaction Completed On Database');
        if (callback) callback(); // برای ایجاد task بعد از موفقیت
        displayData(); // بروزرسانی UI
    };

    transaction.onerror = () => {
        console.log('Error Transaction on Database');
    };
};

const deleteData = (id) => {
    let transaction = db.transaction(['To do'], 'readwrite');
    let objectStore = transaction.objectStore('To do');
    let request = objectStore.delete(id);

    request.onsuccess = () => {
        console.log('Item deleted from DB');
    };

    transaction.oncomplete = () => {
        displayData(); // بروزرسانی UI بعد از حذف
    };
};

function displayData() {
    // پاک کردن محتوای فعلی from
    while (from.firstChild) {
        from.removeChild(from.firstChild);
    }

    let transaction = db.transaction(['To do'], 'readwrite');
    let objectStore = transaction.objectStore('To do');
    let request = objectStore.openCursor();

    request.onsuccess = (e) => {
        let cursor = e.target.result;
        if (cursor) {
            const title = cursor.value.Title.trim();
            const discription = cursor.value.Body.trim();

            if (title === '') return; // اگر خالی، رد کن

            const task = document.createElement('div');
            task.className = 'task border rounded-4 p-4 text-white mb-3 bg-transparent shadow-sm';
            task.setAttribute('data-id', cursor.value.id); // ذخیره id برای حذف

            const titleEl = document.createElement('h5');
            titleEl.className = 'mb-2 fw-bold text-white';
            titleEl.textContent = title;

            const descEl = document.createElement('p');
            descEl.className = 'text-secondary small mb-4';
            descEl.textContent = discription || 'بدون توضیح';

            const actionsRow = document.createElement('div');
            actionsRow.className = 'd-flex align-items-center justify-content-start gap-4 text-secondary fs-5';

            // چک‌باکس انجام شده
            const doneWrapper = document.createElement('div');
            doneWrapper.className = 'd-flex align-items-center gap-2 cursor-pointer';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'd-none';
            checkbox.id = 'done' + Date.now();

            const doneIcon = document.createElement('label');
            doneIcon.setAttribute('for', checkbox.id);
            doneIcon.className = 'm-0';
            doneIcon.innerHTML = '<i class="bi bi-circle"></i>';

            const doneText = document.createElement('span');
            doneText.className = 'fs-6 text-muted';
            doneText.textContent = 'انجام نشده';

            checkbox.addEventListener('change', () => {
                if (checkbox.checked) {
                    titleEl.classList.add('text-decoration-line-through', 'text-muted');
                    descEl.classList.add('text-decoration-line-through', 'text-muted');
                    doneIcon.innerHTML = '<i class="bi bi-check-circle-fill text-success"></i>';
                    doneText.textContent = 'انجام شده';
                    doneText.classList.add('text-success');
                } else {
                    titleEl.classList.remove('text-decoration-line-through', 'text-muted');
                    descEl.classList.remove('text-decoration-line-through', 'text-muted');
                    doneIcon.innerHTML = '<i class="bi bi-circle"></i>';
                    doneText.textContent = 'انجام نشده';
                    doneText.classList.remove('text-success');
                }
            });

            // مورد علاقه
            const favWrapper = document.createElement('div');
            favWrapper.className = 'd-flex align-items-center gap-2';

            const favBtn = document.createElement('button');
            favBtn.className = 'btn btn-link text-secondary p-0';
            favBtn.innerHTML = '<i class="bi bi-heart"></i>';

            const favText = document.createElement('span');
            favText.className = 'fs-6 text-muted';
            favText.textContent = 'علاقه‌مندی';

            favBtn.addEventListener('click', () => {
                favBtn.classList.toggle('text-success');
                const icon = favBtn.querySelector('i');
                if (favBtn.classList.contains('text-success')) {
                    icon.classList.replace('bi-heart', 'bi-heart-fill');
                    favText.classList.add('text-success');
                } else {
                    icon.classList.replace('bi-heart-fill', 'bi-heart');
                    favText.classList.remove('text-success');
                }
            });

            // حذف
            const delWrapper = document.createElement('div');
            delWrapper.className = 'd-flex align-items-center gap-2';

            const delBtn = document.createElement('button');
            delBtn.className = 'btn btn-link text-danger p-0';
            delBtn.innerHTML = '<i class="bi bi-trash3"></i>';

            const delText = document.createElement('span');
            delText.className = 'fs-6 text-danger';
            delText.textContent = 'حذف';

            delBtn.addEventListener('click',() => {
                if (ask) ask.classList.remove('dis-hide');
                if (adduserback) adduserback.classList.remove('dis-hide');
                const yasdelete = document.getElementById('yasdelete');
                if (yasdelete) {
                    yasdelete.onclick = () => {
                        if (ask) ask.classList.add('dis-hide');
                        if (adduserback) adduserback.classList.add('dis-hide');
                        const taskId = parseInt(task.getAttribute('data-id'));
                        deleteData(taskId); // حذف از DB و بروزرسانی UI
                    };
                }
                deleteitem()
            })



            const deleteitem = (e) => {
                let TodoId = Number(e.target.paretElement.getAttribute('task border rounded-4 p-4 text-white mb-3 bg-transparent shadow-sm'))
                let transaction = db.transaction(['To do'], 'readwrite');
                let objectStore = transaction.objectStore('To do');
                let request = objectStore.delete(TodoId);
            }


            // مونتاژ
            doneWrapper.appendChild(checkbox);
            doneWrapper.appendChild(doneIcon);
            doneWrapper.appendChild(doneText);

            favWrapper.appendChild(favBtn);
            favWrapper.appendChild(favText);

            delWrapper.appendChild(delBtn);
            delWrapper.appendChild(delText);

            actionsRow.appendChild(doneWrapper);
            actionsRow.appendChild(favWrapper);
            actionsRow.appendChild(delWrapper);

            task.appendChild(titleEl);
            task.appendChild(descEl);
            task.appendChild(actionsRow);
            from.appendChild(task);

            cursor.continue();
        } else {
            updateCount();
            checkEmptyTasks();
        }
    };
}

if (create) {
    create.addEventListener('click', () => {
        if (display) display.classList.remove('dis-hide');
        const add = document.querySelector('.add');
        if (add) add.classList.add('wide');
        const addUserBack = document.querySelector('.add-user-back');
        if (addUserBack) addUserBack.classList.remove('dis-hide');
    });
}

if (adduserback) {
    adduserback.addEventListener('click', () => {
        if (ask) ask.classList.add('dis-hide');
        if (display) display.classList.add('dis-hide');
        const add = document.querySelector('.add');
        if (add) add.classList.remove('wide');
        const addUserBack = document.querySelector('.add-user-back');
        if (addUserBack) addUserBack.classList.add('dis-hide');
    });
}

if (create2) {
    create2.addEventListener('click', (e) => {
        const title = titleTaskinput?.value.trim() || '';
        if (title === '') {
            alert('Please choose one works!');
            return;
        }

        // اضافه کردن به DB و سپس ایجاد task در callback
        addData(e, () => {
            if (display) display.classList.add('dis-hide');
            const add = document.querySelector('.add');
            if (add) add.classList.remove('wide');
            const addUserBack = document.querySelector('.add-user-back');
            if (addUserBack) addUserBack.classList.add('dis-hide');
            const keytype = document.getElementById('type');
            if (keytype) keytype.classList.remove('dis-hide');
            if (whatttt) whatttt.classList.add('dis-hide');

            setTimeout(() => {
                if (keytype) keytype.classList.add('dis-hide');
                if (whatttt) whatttt.classList.remove('dis-hide');
            }, 4000);
        });
    });
}

// پیام خالی
function checkEmptyTasks() {
    const old = document.getElementById('empty-msg');
    if (old) old.remove();
    if (from.querySelector('.task')) return;

    const msg = document.createElement('div');
    msg.id = 'empty-msg';
    msg.className = 'text-center py-5 text-muted';
    msg.innerHTML = `
        <i class="bi bi-clipboard2-check display-1 d-block mb-4 opacity-50"></i>
        <h3>هیچ تسکی تعریف نشده است</h3>
        <p class="lead">برای شروع روی دکمه + کلیک کنید</p>
    `;
    from.appendChild(msg);
}

function updateCount() {
    const countEl = document.getElementById('count');
    if (countEl) countEl.textContent = from.querySelectorAll('.task').length;
    checkEmptyTasks();
}

updateCount();
checkEmptyTasks();