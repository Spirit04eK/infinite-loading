(async function () {
    //Загрузка постов промисом
    function httpGet(url) {
        return new Promise(function (resolve, reject) {
            let xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.onload = function () {
                if (this.status === 200) {
                    resolve(this.response);
                } else {
                    let error = new Error(this.statusText);
                    error.code = this.status;
                    reject(error);
                }
            };
            xhr.onerror = function () {
                reject(new Error("Network Error"));
            };
            xhr.send();
        });
    }

    //Загрузка данных
    function getData(index) {
        const url = 'https://jsonplaceholder.typicode.com/posts/' + index;
        return httpGet(url).then(response => JSON.parse(response), () => null);
    }


    async function getPosts(page = 0) {
        let promises = [...Array(10).keys()].map(i => getData(i + page * 10 + 1));
        return Promise.all(promises).then(result => {
            if (result.every(val => val === null)) {
                endPosts();
                throw new Error('no more posts');
            } else {
                return result;
            }
        });
    }

    async function* mySuperGenerator() {
        let page = 0;
        while(1) {
            try {
                yield await getPosts(page++);
            } catch (e) {
                return null;
            }
        }
    }


    let generator = mySuperGenerator();

    //Отрисовка постов на странице
    function postOutput(data) {
        let post = document.createElement('div');
        post.className = 'post';
        post.setAttribute('data-id', data.id);
        post.innerHTML = `<div class="post__title"><h2>${data.title.toUpperCase()}</h2></div><div class="post__body"><p>${data.body}</p></div><hr>`;
        let posts = document.getElementById('posts');
        posts.appendChild(post);
    }

    function endPosts() {
        let endPosts = document.getElementById('end_page--text');
        endPosts.innerText = 'End posts';
    }

    //Отслеживание конца страницы
    function onEntry(entry) {
        generator.next().then(result => {
            if (result.done !== true) {
                result.value.forEach(postOutput);
            }
        });
    }
    let options = {
        threshold: [0.5]
    };
    let observer = new IntersectionObserver(onEntry, options);
    let elements = document.querySelector('#end_page');
    observer.observe(elements);

})();
