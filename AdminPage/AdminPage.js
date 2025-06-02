function splitFullName(FullName, separator) {
    let SplittedFullName = FullName.split(separator);
    return (SplittedFullName);
}
function joinFullName(data) {
    data.forEach(row => {
        row.name = [row.secondName, row.name, row.patronymic].join(' ');
    })
}
function generateLogin(fullName) {
    // 1. Транслитерация с русского на английский
    const translitRules = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
        'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
        'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts',
        'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu',
        'я': 'ya',
        'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo', 'Ж': 'Zh',
        'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O',
        'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'H', 'Ц': 'Ts',
        'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Sch', 'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu',
        'Я': 'Ya'
    };

    // Транслитерируем ФИО
    let transliterated = '';
    for (const char of fullName) {
        transliterated += translitRules[char] || char;
    }

    // 2. Формируем базовый логин (фамилия + первые буквы имени и отчества)
    const [lastName, firstName, middleName] = transliterated.split(' ').filter(Boolean);
    let baseLogin = '';

    // Вариант 1: IvanovPS (фамилия + первые буквы имени и отчества)
    if (lastName && firstName && middleName) {
        baseLogin = (
            lastName.toLowerCase() +
            firstName[0].toLowerCase() +
            middleName[0].toLowerCase()
        );
    }
    // Вариант 2: Pyotr.Sergeevich (имя.отчество)
    else if (firstName && middleName) {
        baseLogin = (
            firstName.toLowerCase() + '.' + middleName.toLowerCase()
        );
    }
    // Если только фамилия и имя
    else if (lastName && firstName) {
        baseLogin = (
            lastName.toLowerCase() + firstName[0].toLowerCase()
        );
    }
    // Если только фамилия
    else if (lastName) {
        baseLogin = lastName.toLowerCase();
    }
    // Если что-то пошло не так, используем user + случайное число
    else {
        baseLogin = 'user' + Math.floor(Math.random() * 100);
    }

    // 3. Добавляем случайную цифру (0-9)
    const randomDigit = Math.floor(Math.random() * 10);
    baseLogin += randomDigit;

    // 4. Добавляем случайный спецсимвол
    const specialChars = '!@#$%^&*';
    const randomSpecialChar = specialChars[Math.floor(Math.random() * specialChars.length)];
    baseLogin += randomSpecialChar;

    return baseLogin;
}
function generatePassword(length = 8) {
    if (length < 8) length = 8;

    const groups = [
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ', // Заглавные
        'abcdefghijklmnopqrstuvwxyz', // Строчные
        '0123456789', // Цифры
        '!@#$%^&*' // Спецсимволы
    ];

    // Берем минимум по одному символу из каждой группы
    let password = groups.map(group => group[Math.floor(Math.random() * group.length)]);

    // Дополняем случайными символами из всех групп
    const allChars = groups.join('');
    for (let i = 0; i < length - groups.length; i++) {
        password.push(allChars[Math.floor(Math.random() * allChars.length)]);
    }

    // Перемешиваем
    password = password.sort(() => Math.random() - 0.5).join('');

    return password;
}
async function checkIfUserExists() {

    const data = await fetchDBData()
    let test = document.getElementById('id_userId').value;
    for (const user of data) {
        if (user.id == document.getElementById('id_userId').value) {
            return true;
        }
    }
}
async function checkIfGroupExists(groupName) {
    const groups = await fetchGroups();
    return groups.some(group => group.name === groupName);
}

document.getElementById('profile-tooltip__button-logout').addEventListener('click', e => {
    e.preventDefault();

    Logout();
})

async function Logout() {
    const authtoken = Cookies.get('.AspNetCore.Identity.Application');
    const res = await fetch(`${apiHost}/Users/Logout`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${authtoken}`
        }
    });

    if (res.status === 200) {
        window.location.href = "/LoginPage/LoginPage.html";
    }
}

document.getElementById('id_button_generate_login_password').addEventListener('click', e => {
    e.preventDefault();

    document.getElementById('id_userName').value = generateLogin(document.getElementById('id_userFullName').value);
    document.getElementById('id_userPassword').value = generatePassword()

})

document.getElementById('id_button_admin_save').addEventListener('click', async e => {
    e.preventDefault();

    const from_register_user = document.getElementById('id_form_register_user')
    const from_register_user_styles = window.getComputedStyle(from_register_user);

    if (from_register_user_styles.display != 'none') {
        const SplittedFullName = splitFullName(document.getElementById('id_userFullName').value, " ")

        const data = {
            userId: document.getElementById('id_userId').value,
            userName: document.getElementById('id_userName').value,
            password: document.getElementById('id_userPassword').value,
            name: SplittedFullName[1],
            secondName: SplittedFullName[0],
            patronymic: SplittedFullName[2],
            groupId: document.getElementById('id_groupId').value
        }


        if (await checkIfUserExists()) {
            document.getElementById('id_userId').value = '';
            document.getElementById('id_groupId').value = '';
            putUser(data);
        }
        else {
            document.getElementById('id_groupId').value = '';
            addUser(data);
        }

    }
    else {
        const groupName = document.getElementById('id_groupName').value.trim();
        if (!groupName) {
            alert('Введите название группы');
            return;
        }
        
        if (await checkIfGroupExists(groupName)) {
            alert('Группа с таким названием уже существует');
            return;
        }
        
        const data = { groupName };
        addGroup(data);
    }

})

async function addUser(data) {
    const authtoken = Cookies.get('.AspNetCore.Identity.Application');
    const res = await fetch(`${apiHost}/Users/Register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authtoken}`
        },
        body: JSON.stringify(data)
    });

    if (res.status === 200) {
        alert('Пользователь добавлен')
        fetchDBData();
    }
    // const result = await res.json();
}

async function addGroup(groupName) {
    
    if (!groupName || !groupName.trim()) {
        alert('Введите название группы');
        return false;
    }

    const groups = await fetchGroups();
    if (groups.some(group => group.name === groupName)) {
        alert('Группа с таким названием уже существует');
        return false;
    }

    const authtoken = Cookies.get('.AspNetCore.Identity.Application');
    const res = await fetch(`${apiHost}/Users/Groups?groupName=` + groupName, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authtoken}`
        },
    });

    if (res.ok) {
        document.getElementById("id_groupName-of-user").value = ''
        alert('Группа успешно добавлена');
        await Promise.all([fetchDBData(), setupGroupDropdowns()]);
        return true;
    } else {
        const errorData = await res.json();
        alert(errorData.message || 'Ошибка при добавлении группы');
        return false;
    }
}

async function deleteGroup(groupId) {
    if (!groupId) {
        alert('Группа не выбрана');
        return false;
    }

    if (!confirm('Вы уверены, что хотите удалить эту группу?')) {
        return false;
    }

    try {
        const authtoken = Cookies.get('.AspNetCore.Identity.Application');
        const response = await fetch(`${apiHost}/Users/Groups?id=${groupId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authtoken}`
            }
        });

        if (response.ok) {
            alert('Группа успешно удалена');
            await Promise.all([fetchDBData(), setupGroupDropdowns()]);
            return true;
        } else {
            alert('Ошибка при удалении группы');
            return false;
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Произошла ошибка при удалении группы');
        return false;
    }
}
document.addEventListener('DOMContentLoaded', function () {
    fetchDBData();
    setupGroupDropdowns().then(() => {
        setupGroupButtons();
    });
});

async function fetchDBData() {
    try {
        const authtoken = Cookies.get('.AspNetCore.Identity.Application');
        const response = await fetch(`${apiHost}/Users`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authtoken}`
            },
        });
        const data = await response.json();
        console.log("fetch")
        populateTable(data);
        return data;
    } catch (error) {
        console.error('Ошибка при получении данных:', error);
    }
}
function populateTable(data) {
    const tableBody = document.querySelector('#admin-users-table tbody');
    tableBody.innerHTML = '';
    joinFullName(data);

    data.forEach(row => {
        if (row.name != ' admin ') {

            const tr = document.createElement('tr');

            tr.innerHTML = `
                <td>${row.group}</td>
                <td>${row.name}</td>
                <td>
                    <button id="id_admin-list__button-edit" class="admin-list__button-edit" data-id="${row.id}"></button> 
                    <button id="id_admin-list__button-delete" class="admin-list__button-delete" data-id="${row.id}"></button>
                </td>
            `;

            tableBody.appendChild(tr);
        }
    });

    document.querySelectorAll('.admin-list__button-delete').forEach(btn => {
        btn.addEventListener('click', async function () {
            if (confirm('Вы уверены, что хотите удалить эту запись?')) {
                await deleteRecord(this.getAttribute('data-id'));
                fetchDBData();
            }

        });
    });
    document.querySelectorAll('.admin-list__button-edit').forEach(btn => {
        btn.addEventListener('click', function () {
            editRecord(this.getAttribute('data-id'));
        });
    });
};

async function deleteRecord(id) {
    try {
        if (typeof id === String) {
            arrOfIds = [id];
        }
        const authtoken = Cookies.get('.AspNetCore.Identity.Application');
        const response = await fetch(`${apiHost}/Users?userId=` + id, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authtoken}`,
            }
        });
        alert('Запись успешно удалена');
        fetchDBData();
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось удалить запись');
    }
}
async function editRecord(id) {
    const userdata = await fetchDBData();
    const groupdata = await fetchGroups();
    userdata.forEach(user => {
        if (user.id === id) {
            document.getElementById('id_groupName-of-user').value = `${user.group}`
            document.getElementById('id_userFullName').value = user.name
            document.getElementById('id_userId').value = user.id
            groupdata.forEach(group => {
                if (user.group === group.name) {
                    document.getElementById('id_groupId').value = group.id
                }
            })
        }
    });
}

async function putUser(data) {
    try {
        const authtoken = Cookies.get('.AspNetCore.Identity.Application');
        const response = await fetch(`${apiHost}/Users/${data.userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authtoken}`
            },
            body: JSON.stringify(data)
        });
        if (response.status == 200) {
            alert('Запись успешно изменена');
        }
        else{alert('oops')}
        fetchDBData();
    } catch (error) {

    }

}

async function fetchGroups() {
    try {
        const authtoken = Cookies.get('.AspNetCore.Identity.Application');
        const response = await fetch(`${apiHost}/Users/Groups`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authtoken}`
            },
        });
        return await response.json();
    } catch (error) {
        console.error('Ошибка при получении списка групп:', error);
        return [];
    }
}

async function setupGroupDropdowns() {
    const groups = await fetchGroups();
    
    document.querySelectorAll('.profile-tooltip__button-chevron').forEach(btn => {
        btn.replaceWith(btn.cloneNode(true));
    });

    document.body.addEventListener('click', function(e) {
        if (e.target.closest('#student-tab ~ .tabs__content .profile-tooltip__button-chevron')) {
            e.preventDefault();
            toggleGroupDropdown(e.target, groups, 'id_groupName-of-user', 'id_groupId');
        }
        
        if (e.target.closest('#group-tab ~ .tabs__content .profile-tooltip__button-chevron')) {
            e.preventDefault();
            toggleGroupDropdown(e.target, groups, 'id_groupName');
        }
    });
}

function toggleGroupDropdown(button, groups, inputNameId, inputGroupId = null) {
    
    const existingDropdown = button.nextElementSibling;

    if (existingDropdown && existingDropdown.classList.contains('group-dropdown')) {
        existingDropdown.remove();
        return;
        }
    document.querySelectorAll('.group-dropdown').forEach(d => d.remove());
    
    const dropdown = document.createElement('div');
    dropdown.className = 'group-dropdown';
    
    button.parentNode.insertBefore(dropdown, button.nextSibling);

    groups.forEach(group => {
        const item = document.createElement('div');
        item.className = 'group-dropdown-item';
        item.textContent = group.name;
        
        item.addEventListener('click', () => {
            document.getElementById(inputNameId).value = group.name;
            if (inputGroupId && document.getElementById(inputGroupId)) {
                document.getElementById(inputGroupId).value = group.id;
            }
            dropdown.remove();
        });
        
        dropdown.appendChild(item);
    });

    const rect = button.getBoundingClientRect();
    const parentRect = button.parentNode.getBoundingClientRect();
    
    Object.assign(dropdown.style, {
        position: 'absolute',
        top: `${rect.bottom - parentRect.top}px`,
        left: `${rect.left - parentRect.left}px`,
        zIndex: 1000,
        width: `${rect.width}px`
    });
    
    const closeHandler = (e) => {
        if (!dropdown.contains(e.target) && e.target !== button) {
            dropdown.remove();
            document.removeEventListener('click', closeHandler);
        }
    };
    
    setTimeout(() => document.addEventListener('click', closeHandler), 0);
}

function setupGroupButtons() {
    document.querySelector('.profile-tooltip__button-add-group')?.addEventListener('click', async function(e) {
        e.preventDefault();
        const groupNameInput = document.getElementById('id_groupName-of-user');
        const groupName = groupNameInput.value.trim();
        
        if (!groupName) {
            alert('Введите название группы в поле ввода');
            return;
        }

        const success = await addGroup(groupName);
        if (success) {
            await setupGroupDropdowns();
            document.getElementById('id_groupId').value = '';
        }
    });
    document.querySelector('.profile-tooltip__button-delete-group')?.addEventListener('click', async function(e) {
        e.preventDefault();
        const groupId = document.getElementById('id_groupId').value;
        const groupName = document.getElementById('id_groupName-of-user').value;
        
        if (!groupId || !groupName) {
            alert('Сначала выберите группу из списка');
            return;
        }

        const success = await deleteGroup(groupId);
        if (success) {
            await setupGroupDropdowns();
            document.getElementById('id_groupName-of-user').value = '';
            document.getElementById('id_groupId').value = '';
        }
    });
}