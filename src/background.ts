import { renderProjectsFromLocalStorage, waitForAndObserveTaskList } from "./pomofocus";
import waitAndInsertSendButton from "./todoist";

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  // this listener is called when the active tab is changed
  const tab = await chrome.tabs.get(activeInfo.tabId);
  if (tab.url.includes('pomofocus.io')) {
    chrome.scripting.executeScript({
      target: { tabId: activeInfo.tabId },
      func: renderProjectsFromLocalStorage,
    });
  }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // this listener is called when the url of the tab is changed - e.g. when the user first opens the pomofocus.io tab
  if (tab.url.includes('pomofocus.io') && changeInfo.status === 'complete') {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: waitForAndObserveTaskList,
    });
  }
  if (tab.url.includes('todoist.com') && changeInfo.status === 'complete') {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: waitAndInsertSendButton,
    });
  }
});
