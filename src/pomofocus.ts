// import toast from './toaster'

export const waitForAndObserveTaskList = () => {
  let taskDiv;
  let taskNodes;

  let tasks : {
    title: string,
    description?: string,
    project?: string,
    currentPomos: number,
    targetPomos: number,
    element: HTMLElement,
  }[] = []
  let selectedProjects : string[] = []

  const setTasks = (newTasks) => {
    tasks = newTasks
  }



  const getElementByXpath = (path) => {
    return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  }

  const populateTaskList = () => {
    const temporaryTaskList = []

    taskNodes.childNodes.forEach((task : HTMLElement | any) => {

      const wholeTask = task.childNodes[0].childNodes
      const taskHeader = wholeTask[0].childNodes
      // taskOverview = [div = checkBox, div = details]
      const taskOverview = taskHeader[0].childNodes
      // details = [span = project, text, text = title]
      const details = taskOverview[1].childNodes
      // pomos = [div = current, div, div=target]
      const pomos = taskHeader[1].childNodes[0].childNodes

      let description : string
      if (wholeTask.length > 1) {
          const descriptionElement = wholeTask[1].childNodes[0].childNodes[0]
          description = descriptionElement.data
      } 

      let project : string
      let title : string
      let currentPomos : number 
      let targetPomos : number
      let element: HTMLElement

      project = details[0].childNodes[0]?.data
      title = details[2].data
      currentPomos = parseInt(pomos[0].data)
      targetPomos = parseInt(pomos[1].childNodes[1].data)
      element = task

      const taskObject = {
        project: project,
        title: title,
        description: description,
        currentPomos: currentPomos,
        targetPomos: targetPomos,
        element: element,
      }

      temporaryTaskList.push(taskObject)
    })

    setTasks(temporaryTaskList)
  }

  const clearSelectedProjects = () => {
    selectedProjects = []
    const elements = document.getElementsByClassName('filter-item')
    // reset style
    Array.from(elements).forEach((item : HTMLElement) => {
      
        item.style.background = 'rgb(240, 240, 240)'
        const plusIcon : HTMLElement = item.childNodes[0] as HTMLElement
        plusIcon.style.display = 'flex'

        const minusIcon : HTMLElement = item.childNodes[1] as HTMLElement
        minusIcon.style.display = 'none'

        const text : HTMLElement = item.childNodes[2] as HTMLElement
        text.style.color = 'rgb(163, 163, 163)'
    })
    filterTasks()
  }

  const refreshTaskList = () => {
    // remove all the task nodes
    populateTaskList()
    createProjectFilter()
  }

  const waitForTaskList = setInterval(() => {
    taskDiv = getElementByXpath("//*[@id='target']/div/div[1]/div[2]/div/div[3]")
    if (taskDiv) {
        taskNodes = taskDiv.childNodes[1]
        clearInterval(waitForTaskList);
        refreshTaskList();

        // Observe the task list for changes
        //let taskListObserver = new MutationObserver(() => refreshTaskList(taskNodes));
        let taskListObserver = new MutationObserver(() => refreshTaskList());
        taskListObserver.observe(taskNodes, {childList: true});
    }
  }, 200);

  setTimeout(() => {
      clearInterval(waitForTaskList);
  }, 2000);


  const filterTasks = () => {

    tasks.forEach(task => {
      task.element.style.display = 'none'
    })

    tasks.forEach(task => {
      if (selectedProjects.includes(task.project) || selectedProjects.length === 0) {
        task.element.style.display = 'block'
      }
    })

  }

  const renderProjects = (filterPopup) => {

    const styleFilterButton = (button) => {
        button.style.display = 'flex'
        button.style.alignItems = 'center'
        button.style.padding = '4px'
        button.style.marginBottom = '2px'
        button.style.cursor = 'pointer'
        button.style.transition = 'background-color 0.1s ease 0s'
        button.style.justifyContent = 'space-between'
        button.style.borderRadius = '3px'
        button.style.userSelect = 'none'

        button.style.background = 'rgb(240, 240, 240)'
        button.style.fontSize = '13px'
        button.style.borderRadius = '4px'
        button.style.padding = '2px 6px'
        button.style.color = 'rgb(163, 163, 163)'
        // button.style.marginLeft = '12px'
        

        return button
    }

    const styleClearFilterButton = (button) => {
        button.style.display = 'flex'
        button.style.alignItems = 'center'
        button.style.padding = '4px'
        button.style.marginBottom = '2px'
        button.style.cursor = 'pointer'
        button.style.transition = 'background-color 0.1s ease 0s'
        button.style.justifyContent = 'space-between'
        button.style.borderRadius = '3px'
        button.style.userSelect = 'none'
        button.style.color = 'black'

        button.style.marginBottom = '5px'
        button.style.borderBottom = '1px solid lightgrey'
        button.style.whiteSpace = 'nowrap'

        return button
    }

    filterPopup.innerHTML = ''

    const clearFilterButton = styleClearFilterButton(document.createElement('div'))

    clearFilterButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" style="margin-left: 3px" viewBox="0 0 24 24" fill="none" stroke="none" color="currentColor" stroke-width="2">
            <path d="M19 3H5C3.89543 3 3 3.89543 3 5V6.17157C3 6.70201 3.21071 7.21071 3.58579 7.58579L9.41421 13.4142C9.78929 13.7893 10 14.298 10 14.8284V20V20.2857C10 20.9183 10.7649 21.2351 11.2122 20.7878L12 20L13.4142 18.5858C13.7893 18.2107 14 17.702 14 17.1716V14.8284C14 14.298 14.2107 13.7893 14.5858 13.4142L20.4142 7.58579C20.7893 7.21071 21 6.70201 21 6.17157V5C21 3.89543 20.1046 3 19 3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>

        Clear Filter
    `

    clearFilterButton.addEventListener('click', () => {
        clearSelectedProjects()
    })

    filterPopup.appendChild(clearFilterButton)

    const unassigned = styleFilterButton(document.createElement('div'))
    unassigned.style.display = 'flex'
    unassigned.style.alignItems = 'center'
    const textSpan = document.createElement('span') 
    textSpan.style.fontSize = '13px'
    textSpan.style.borderRadius = '4px'
    textSpan.style.padding = '2px 6px'
    textSpan.style.color = 'rgb(163, 163, 163)'
    textSpan.style.marginLeft = '12px'
    
    textSpan.innerHTML = 'Unassigned'

    const plusIconSpan = document.createElement('span')
    const minusIconSpan = document.createElement('span')
    plusIconSpan.innerHTML = `
        <svg width="24px" height="24px" style="display: flex;" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 12H15" stroke="#323232" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 9L12 15" stroke="#323232" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    `
    minusIconSpan.innerHTML = `
        <svg width="24px" height="24px" style="display: flex;" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 12H15" stroke="#323232" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    `
    minusIconSpan.style.display = 'none'

    unassigned.appendChild(plusIconSpan)
    unassigned.appendChild(minusIconSpan)
    unassigned.appendChild(textSpan)

    unassigned.className = 'filter-item'
    unassigned.onclick = () => {

      const filteredTasks = tasks.filter(task => task.project == undefined)
      
      if (unassigned.style.background == 'rgba(57, 112, 151, 0.12)') {
          // remove project from selected projects
          selectedProjects = selectedProjects.filter(selectedProject => selectedProject != undefined)

          minusIconSpan.style.display = 'none'
          plusIconSpan.style.display = 'flex'
          
          textSpan.style.color = 'rgb(163, 163, 163)'
          unassigned.style.background = 'rgb(240, 240, 240)'
      } else {
          // add project to selected projects
          selectedProjects.push(undefined)

          minusIconSpan.style.display = 'flex'
          plusIconSpan.style.display = 'none' 

          textSpan.style.color = 'black'
          unassigned.style.background = 'rgba(57, 112, 151, 0.12)'
      }

      filterTasks()
    }

    filterPopup.appendChild(unassigned)

    Array.from(new Set(tasks.map(task => task.project))).map((project, i) => {

        if (project === undefined) return

        const filterItem = styleFilterButton(document.createElement('div'))
        filterItem.style.display = 'flex'
        filterItem.style.alignItems = 'center'
        filterItem.className = 'filter-item'

        const textSpan = document.createElement('span') 
        textSpan.style.paddingLeft = '6px'
        textSpan.style.textAlign = 'end'
        textSpan.innerHTML = project
        textSpan.style.padding = '2px 6px'
        textSpan.style.color = 'rgb(163, 163, 163)'
        textSpan.style.marginLeft = '12px'
    

        const plusIconSpan = document.createElement('span')
        const minusIconSpan = document.createElement('span')
        plusIconSpan.innerHTML = `
            <svg width="24px" height="24px" style="display: flex;" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12H15" stroke="#323232" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 9L12 15" stroke="#323232" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `
        minusIconSpan.innerHTML = `
            <svg width="24px" height="24px" style="display: flex;" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12H15" stroke="#323232" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `
        minusIconSpan.style.display = 'none'

        filterItem.appendChild(plusIconSpan)
        filterItem.appendChild(minusIconSpan)
        filterItem.appendChild(textSpan)

        filterItem.onclick = () => {

            const filteredTasks = tasks.filter(task => task.project === project)

            if (filterItem.style.background == 'rgba(57, 112, 151, 0.12)') {
                // remove project from selected projects
                selectedProjects = selectedProjects.filter(selectedProject => selectedProject != project)

                minusIconSpan.style.display = 'none'
                plusIconSpan.style.display = 'flex'
                
                textSpan.style.color = 'rgb(163, 163, 163)'
                filterItem.style.background = 'rgb(240, 240, 240)'
            } else {
                // add project to selected projects
                selectedProjects.push(project)

                minusIconSpan.style.display = 'flex'
                plusIconSpan.style.display = 'none' 

                textSpan.style.color = 'black'
                filterItem.style.background = 'rgba(57, 112, 151, 0.12)'
            }

            filterTasks()
        }

        filterPopup.appendChild(filterItem)
    })

  }


  const createProjectFilter = () => {

    // Styling
    const styleIconButton = (button) => {
        button.style.display = 'flex'
        button.style.alignItems = 'center'
        button.style.justifyContent = 'center'
        button.style.textAlign = 'center'
        button.style.borderRadius = '4px'
        button.style.cursor = 'pointer'
        button.style.opacity = '0.9'
        button.style.background = 'none rgba(255, 255, 255, 0.2)'
        button.style.boxShadow = 'none'
        button.style.marginLeft = '10px'
        button.style.fontSize = '13px'
        button.style.padding = '8px'
        button.style.minWidth = 'auto'
        button.style.border = 'none'
        button.style.color = 'white !important'

        return button
    }

    const styleFilterPopup = (filterPopup) => {
        filterPopup.style.position = 'absolute'
        filterPopup.style.display = 'none'
        filterPopup.style.borderRadius = '4px'
        filterPopup.style.opacity = '1'
        filterPopup.style.padding = '4px 0px'
        filterPopup.style.boxShadow = 'rgb(0 0 0 / 15%) 0px 10px 20px, rgb(0 0 0 / 10%) 0px 3px 6px'
        filterPopup.style.pointerEvents = 'auto'
        filterPopup.style.backgroundColor = 'white'
        filterPopup.style.transform = 'translateY(10px)'
        filterPopup.style.padding = '14px 20px'
        filterPopup.style.right = '0px'
        filterPopup.style.zIndex = '1'

        return filterPopup
    }

    document.querySelector('div[id="filter-wrapper"]')?.remove()

    const placeToInsert = getElementByXpath('//*[@id="target"]/div/div[1]/div[2]/div/div[3]/div[1]')

    // Create popup element
    const filterWrapper = document.createElement('div')
    filterWrapper.id = 'filter-wrapper'
    filterWrapper.style.position = 'relative'
    const filterPopup = styleFilterPopup(document.createElement('div'))

    const iconButton = styleIconButton(document.createElement('button'))
    iconButton.innerHTML = '<svg viewBox="0 0 24 24" width=16 height=16><path style="fill: white;" d="M19 3H5C3.89543 3 3 3.89543 3 5V6.17157C3 6.70201 3.21071 7.21071 3.58579 7.58579L9.41421 13.4142C9.78929 13.7893 10 14.298 10 14.8284V20V20.2857C10 20.9183 10.7649 21.2351 11.2122 20.7878L12 20L13.4142 18.5858C13.7893 18.2107 14 17.702 14 17.1716V14.8284C14 14.298 14.2107 13.7893 14.5858 13.4142L20.4142 7.58579C20.7893 7.21071 21 6.70201 21 6.17157V5C21 3.89543 20.1046 3 19 3Z"></path></svg>'
    iconButton.addEventListener('click', () => {
      toggleFilterModal()
    })

    filterWrapper.appendChild(iconButton)
    filterWrapper.appendChild(filterPopup)
    placeToInsert.appendChild(filterWrapper)


    const toggleFilterModal = () => {
        filterPopup.style.display = filterPopup.style.display === 'none' ? 'block' : 'none'
    }

    const handleClickOutside = (e) => {
        if (!filterWrapper.contains(e.target)) {
            filterPopup.style.display = 'none'
        }
    }

    document.addEventListener('click', handleClickOutside)

    renderProjects(filterPopup)

  }
}


export const renderProjectsFromLocalStorage = () => {
  type LocalStorageTask = {
      title: string,
      project: string
  }

  const toastClearCache = () => {
    const toast = document.createElement('div')
    toast.style.zIndex = '2147483648'
    toast.style.position = 'fixed'
    toast.style.bottom = '20px'
    toast.style.left = '20px'
    toast.style.right = '20px'
    toast.style.margin = 'auto'
    toast.style.maxWidth = '510px'

    toast.style.backgroundColor = 'ghostwhite'
    toast.style.borderRadius = '4px'

    // add box shadow
    toast.style.boxShadow = 'rgb(0 0 0 / 15%) 0px 10px 20px, rgb(0 0 0 / 10%) 0px 3px 6px'

    // create toast message
    const toastMessage = document.createElement('p')
    toastMessage.style.display = 'flex'
    toastMessage.style.alignItems = 'center'
    toastMessage.style.justifyContent = 'center'

    toastMessage.textContent = 'Could not find pomofocus item'

    const clearCacheButton = document.createElement('button')
    clearCacheButton.textContent = 'Clear Cache'
    clearCacheButton.style.marginLeft = '10px'
    clearCacheButton.style.padding = '4px'
    clearCacheButton.style.borderRadius = '4px'
    clearCacheButton.style.border = 'none'
    clearCacheButton.style.cursor = 'pointer'
    clearCacheButton.style.background = 'rgb(240, 240, 240)'
    clearCacheButton.style.fontSize = '13px'
    clearCacheButton.style.color = 'rgb(163, 163, 163)'


    clearCacheButton.addEventListener('click', () => {
      chrome.storage.local.set({ tasks: [] })
      toast.style.display = 'none'
    })

    toastMessage.appendChild(clearCacheButton)

    // append toast message to toast div
    toast.appendChild(toastMessage)

    // append toast div to body
    document.body.appendChild(toast)

    // remove toast after 3 seconds
    setTimeout(() => {
      const removeFadeOut = ( el, speed ) => { // https://stackoverflow.com/a/33424474
        var seconds = speed/1000;
        el.style.transition = "opacity "+seconds+"s ease";

        el.style.opacity = 0;
        setTimeout(function() {
            el.parentNode.removeChild(el);
        }, speed);
    }
      removeFadeOut(toast, 300)
    }
    , 30000)
  }


  const toast = () => {
    // create toast div
    const toast = document.createElement('div')
    toast.style.position = 'fixed'
    toast.style.bottom = '20px'
    toast.style.left = '20px'
    toast.style.right = '20px'
    toast.style.margin = 'auto'
    toast.style.maxWidth = '510px'

    toast.style.backgroundColor = 'ghostwhite'
    toast.style.borderRadius = '4px'

    // add box shadow
    toast.style.boxShadow = 'rgb(0 0 0 / 15%) 0px 10px 20px, rgb(0 0 0 / 10%) 0px 3px 6px'

    // create toast message
    const toastMessage = document.createElement('p')
    toastMessage.style.display = 'flex'
    toastMessage.style.alignItems = 'center'
    toastMessage.style.justifyContent = 'center'

    toastMessage.textContent = 'Please log in to use todoist implementation.'

    // append toast message to toast div
    toast.appendChild(toastMessage)

    // append toast div to body
    document.body.appendChild(toast)

    // remove toast after 3 seconds
    setTimeout(() => {
      const removeFadeOut = ( el, speed ) => { // https://stackoverflow.com/a/33424474
        var seconds = speed/1000;
        el.style.transition = "opacity "+seconds+"s ease";

        el.style.opacity = 0;
        setTimeout(function() {
            el.parentNode.removeChild(el);
        }, speed);
    }
      removeFadeOut(toast, 300)
    }
    , 3000)
  }

  const getElementByXpath = (path) => {
    return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  }

  const renderTasks = () => {


    chrome.storage.local.get('tasks', (tasks: { 'tasks': LocalStorageTask[] }) => {
      let localTasks = tasks
      // if the tasks object == {}, return
      console.log(localTasks.tasks)
      if (localTasks.tasks.length === 0) { return }


      const importButton = getElementByXpath("//div[contains(text(), 'Import from Todoist')]") as HTMLButtonElement


      const loginButton = getElementByXpath("//div[contains(text(), 'Login')]") as HTMLButtonElement

      if (loginButton) {
        toast()
        return;
      }

      

      importButton.click()

      const importModal = getElementByXpath('//*[@id="target"]/div/div[7]') as HTMLDivElement
      // importModal.style.display = 'none'

      let importList
      // wait for the import modal to appear
      const waitForImportModal = setInterval(() => {
        const importModal = getElementByXpath("//div[contains(text(), 'Choose Tasks to Import')]").parentNode as HTMLDivElement
        if (importModal.childNodes[1]?.childNodes[1] != undefined) {
          importList = importModal.childNodes[1].childNodes[1]
        }

        if (importList) {

          if (importList.childNodes.length) {
            clearInterval(waitForImportModal)
            console.log('done waiting')

            let i = 0
            importList.childNodes.forEach(element => {
                // if the first child of the element is a span
                if (element.childNodes[0].nodeName === 'SPAN') {
                  let project = element.childNodes[0].childNodes[0].textContent
                  // if there is a spacebar at the end of the project name, remove it
                  if (project[project.length - 1] === ' ') {
                    project = project.slice(0, -1)
                  }

                  let title = element.childNodes[0].childNodes[1].textContent
                  // if there is a spacebar at the end of the title name, remove it
                  if (title[title.length - 1] === ' ') {
                    title = title.slice(0, -1)
                  }

 
                  // if the project and title match a task in localTasks, click the element and remove the task from the localTasks array
                  if (localTasks.tasks.some(task => (
                      task.project == project || 

                      // if there is a forward slash in the title, only use the text before the forward slash
                      task.project.split('/')[0].slice(0, -1) == project
                    ) && task.title == title)) {
                    localTasks.tasks = localTasks.tasks.filter(task => task.project !== project && task.title !== title)
                    console.log('clicking')
                    element.click()
                  }

              }
            });

            if (localTasks.tasks.length > 0) {
              toastClearCache()
            }

            console.log('local tasks')
            console.log(localTasks)

            // save localTasks back to storage
            chrome.storage.local.set({ tasks: localTasks.tasks })

            // click the import when it is not disabled
            const waitForImportButton = setInterval(() => {
              let finalImportButton = getElementByXpath('//div[contains(text(), "Choose Tasks to Import")]/following-sibling::*[2]//button[position()=2]') as HTMLButtonElement

              if (finalImportButton) {
                console.log('found final import button')
                console.log(finalImportButton)
                if (!finalImportButton.disabled) {
                  clearInterval(waitForImportButton)
                  console.log(finalImportButton)
                  finalImportButton.click()
                  let clearSelectionButton = getElementByXpath('//*[@id="target"]/div/div[7]/div/div/div/div[3]/button[1]') as HTMLButtonElement
                  clearSelectionButton.click()
                }
              }
            }, 200)
          }

        }
      }, 200)

      setTimeout(() => {
        clearInterval(waitForImportModal);
      }, 2000);

    })

    }

    let taskDiv;
    let taskNodes;
    let clickedOpenModal = false;

    const waitForTaskList = setInterval(() => {
      taskDiv = getElementByXpath("//*[@id='target']/div/div[1]/div[2]/div/div[3]")
      if (taskDiv) {
        taskNodes = taskDiv.childNodes[1]
        clearInterval(waitForTaskList);
        renderTasks()
      }
    }, 200);

    setTimeout(() => {
      clearInterval(waitForTaskList);
    }, 2000);




}