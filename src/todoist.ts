const waitAndInsertSendButton = () => {

    const getElementByXpath = (path) => {
        return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    }

    const appendSendButton = (div: HTMLElement, title: string, project: string) => {
        div.addEventListener('mousedown', (event: MouseEvent) => {
            if (event.button == 2) {
                const waitForPopper = setInterval(() => {
                    const popper = getElementByXpath('//*[@class=" popper"]')
                    if (popper) {
                        clearInterval(waitForPopper)
                        popper.childNodes[0].childNodes.forEach((popperChild : HTMLLIElement) => {
                            // is popperChild is a list item with role 'menuitem'
                            if (popperChild.nodeName == 'LI' && popperChild.getAttribute('role') == 'menuitem') {
                                // this weird foreach loop finds the correct spot to insert, 
                                // and the 'let inserted' is needed because it would insert it multiple times otherwise.
                                let inserted = false;
                                popperChild.childNodes.forEach(element => {
                                    if (element.textContent == 'Copy link to task') {
                                        if (popperChild.nextElementSibling.hasAttribute('title')) {
                                            console.log('Already inserted')
                                        } else {
                                        if (!inserted) {
                                            popperChild.after(createSendButton(title, project))
                                            inserted = true;
                                        } }
                                        // break foreach
                                        return;
                                    }
                                })
                            }
                        })
                    }
                }, 200)
            }

        }) 
    }

    const createSendButton = (title: string, project: string) => {
        const pomoLi = document.createElement('li');
        pomoLi.role = 'menuitem';
        pomoLi.tabIndex = 0;
        pomoLi.className = 'menu_item icon_menu_item'
        pomoLi.title = 'Send to Pomofocus'

        const pomoIcon = document.createElement('div');
        pomoIcon.className = 'icon_menu_item__icon'
        pomoIcon.ariaHidden = 'true'

        const image = document.createElement('img')
        image.src = 'https://pomofocus.io/favicon.ico'
        image.width = 20
        image.height = 20
        pomoIcon.appendChild(image)

        pomoLi.appendChild(pomoIcon)

        const pomoText = document.createElement('div');
        pomoText.className = 'icon_menu_item__content'
        pomoText.innerText = 'Send to Pomofocus'

        pomoLi.appendChild(pomoText)

        pomoLi.style.fontSize = '14px';

        pomoLi.addEventListener('click', () => {
            console.log('Clicked pomofocus button')
            console.log([title, project])

            let localTasks;
            chrome.storage.local.get('tasks', (tasks : { tasks : [] } | undefined) => {            

                if (Object.keys(tasks).length > 0) {
                    localTasks = tasks.tasks
                }
                else {
                    localTasks = []
                }

                console.log(localTasks)

                localTasks.push({
                    title: title,
                    project: project,
                })

                chrome.storage.local.set({tasks: localTasks})
            })
        })

        return pomoLi;

    }

    const waitForContent = setInterval(() => {
        console.log('waiting for main_content')

        let content

        content = getElementByXpath('//*[@class="main_content"]')

        if (content) { 
            clearInterval(waitForContent)
            // found main content

            let projectDiv = getElementByXpath('//*[contains(@class, "view_header")]')
            
            let project;
            try {
                project = projectDiv.childNodes[0].childNodes[0].textContent
            } catch {
                // do nothing
            }

            if (project) {
            // # This part runs when there are elements without a project assigned within the element

                let boardTasks = document.getElementsByClassName('board_task')

                for (let i = 0; i < boardTasks.length; i++) {

                    const title = boardTasks[i].getElementsByClassName('board_task__details__content')[0].childNodes[0].textContent

                    appendSendButton(boardTasks[i] as HTMLElement, title, project)

                } 

                let taskListItems = document.getElementsByClassName('task_list_item--project_hidden')

                for (let i = 0; i < taskListItems.length; i++) {

                    console.log(taskListItems[i])

                    const title = taskListItems[i].getElementsByClassName('task_list_item__content')[0].childNodes[0].childNodes[0].textContent

                    appendSendButton(taskListItems[i] as HTMLElement, title, project)

                }

            } 

            // # This part runs when there are elements with a project assigned to them

            // get elements which have the class 'task_list_item' but they must not have the 'task_list_item--project_hidden' class
            let taskListItems = document.getElementsByClassName('task_list_item')
            const taskListItemsWithProject = Array.from(taskListItems).filter((element : HTMLElement) => {
                return !element.classList.contains('task_list_item--project_hidden')
            })

            for (let i = 0; i < taskListItemsWithProject.length; i++) {

                const title = taskListItemsWithProject[i].getElementsByClassName('task_list_item__content__wrapper')[0].childNodes[0].textContent

                const project = taskListItemsWithProject[i].getElementsByClassName('task_list_item__project')[0].textContent

                appendSendButton(taskListItemsWithProject[i] as HTMLElement, title, project)

            }

            // # Rest:

            let contentObserver = new MutationObserver(() => console.log('Mutation'))
            contentObserver.observe(content, {childList: true})
        }


        /**
         * These are the types of content views in Todoist:
         * - class="task_list_item", found in 
         *   - Filter-view, 
         *   - Upcoming-view, 
         *   - Today-view,
         * - class="task_list_item task_list_item--project_hidden"
         *   - Inbox view : there is no associated project, so the project should be set to 'Inbox'
         *   - Project view / List : the project is hidden, so the project should be set from the div with the class 'view_header'
         * - class="board_task"
         *   - Project view / Board : the project is hidden, so it should be found from the header. 
         */

        /**
         * These are the elements which should be waited for:
         * - class="main_content"
         *   - Inbox (project in class view_header.childNodes[0].childNodes[0].textContent)
         *   - Today (project inside of task)
         *   - Upcoming (project inside of task)
         *   - 
         */



    }, 200);

    setTimeout(() => {
        clearInterval(waitForContent)
    }, 2000)
    
}


export default waitAndInsertSendButton