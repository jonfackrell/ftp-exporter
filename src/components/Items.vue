<template>   
<div>
<div class="h-screen flex overflow-hidden bg-white">
  <!-- Static sidebar for desktop -->
  <div class="hidden lg:flex lg:flex-shrink-0">
    <div class="flex flex-col w-64 border-r border-gray-200 pt-5 pb-4 bg-gray-100">
      <div class="flex items-center flex-shrink-0 px-6">
        <h1 class="text-3xl">Exporter</h1>
      </div>
      <!-- Sidebar component, swap this element with another sidebar if you like -->
      <div class="h-0 flex-1 flex flex-col overflow-y-auto">
        <!-- User account dropdown -->
        <div class="px-3 mt-6 relative inline-block text-left">          

        </div>
        <!-- Sidebar Search -->
        <div class="px-3 mt-5">
          <label for="search" class="sr-only">Search</label>
          <div class="mt-1 relative rounded-md shadow-sm">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" aria-hidden="true">
              <!-- Heroicon name: search -->
              <svg class="mr-3 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
              </svg>
            </div>
            <input v-on:keyup="search"
                   v-model="q"
                   type="text" 
                   name="search" 
                   id="search" 
                   class="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-9 sm:text-sm border-gray-300 rounded-md" placeholder="Search">
          </div>
        </div>
        <!-- Navigation -->
        <nav class="px-3 mt-6">
          <div class="space-y-1">
            <!-- Current: "bg-gray-200 text-gray-900", Default: "text-gray-700 hover:text-gray-900 hover:bg-gray-50" -->
            <a v-on:click="showAll" 
               href="#" 
               v-bind:class="{ 'bg-gray-200' : completed === false }"
               class="text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
              <!-- Current: "text-gray-500", Default: "text-gray-400 group-hover:text-gray-500" -->
              <!-- Heroicon name: home -->
              <svg class="text-gray-500 mr-3 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
              </svg>
              Show All
            </a>
            <!-- Current: "bg-gray-200 text-gray-900", Default: "text-gray-700 hover:text-gray-900 hover:bg-gray-50" -->
            <a v-on:click="showCompleted" 
               href="#" 
               v-bind:class="{ 'bg-gray-200' : completed === true }"
               class="text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
              <!-- Current: "text-gray-500", Default: "text-gray-400 group-hover:text-gray-500" -->
              <!-- Heroicon name: home -->
              <svg class="text-gray-500 mr-3 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              Show Completed
            </a>
            <a v-on:click="createOmekaPages" 
               href="#" 
               class="text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
              <!-- Current: "text-gray-500", Default: "text-gray-400 group-hover:text-gray-500" -->
              <!-- Heroicon name: home -->
              <svg class="text-gray-500 mr-3 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Create Pages
            </a>
          </div>
          <div class="mt-8">
            <!-- Secondary navigation -->
            <div class=" flex items-center justify-between">
              <h3 class="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider" id="teams-headline">
                Folders
              </h3>
              <div @click="showAddFolder = ! showAddFolder">
                <svg class="h-4 w-4 cursor-pointer" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
            </div>            
            <div v-show="showAddFolder">
              <div class="p-2">
                <label for="folder" class="sr-only">New Folder Name</label>
                <div class="mt-1 flex rounded-md shadow-sm">
                  <div class="relative flex items-stretch flex-grow focus-within:z-10">                
                    <input v-model="newFolderName"
                            type="text" 
                            name="folder" 
                            id="new-folder" 
                            class="focus:ring-indigo-500 focus:border-indigo-500 block w-full rounded-none rounded-l-md pl-2 sm:text-sm border-gray-300" 
                            placeholder="Folder name">
                  </div>
                  <button v-on:click="createNewFolder()"
                          class="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500">
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>
            <div class="mt-1 space-y-1" role="group" aria-labelledby="teams-headline">              
              <ul>
                <li v-for="(folder, index) in folders" v-bind:key="index"
                  v-on:click="showFolder(folder)"
                  v-bind:class="{ 'bg-gray-200' : activeFolder && activeFolder.name === folder.name }"
                  class="group flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:text-gray-900 hover:bg-gray-50 cursor-pointer">
                  <span class="truncate">
                    {{ folder.name }}
                  </span>
                </li>
              </ul>
            </div>
            <hr class="border-t border-gray-200 my-5" aria-hidden="true">
            <div class="flex-1 px-2 space-y-1">
              <a @click="showSettings = true"
                 href="#" class="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                <svg class="text-gray-400 group-hover:text-gray-500 mr-3 h-6 w-6" x-description="Heroicon name: outline/cog" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
</svg>
                Settings
              </a>                
              </div>
          </div>
        </nav>
      </div>
    </div>
  </div>
  <!-- Main column -->
  <div class="flex flex-col w-0 flex-1 overflow-hidden">
    <!-- Search header -->
    <div class="relative z-10 flex-shrink-0 flex h-16 bg-white border-b border-gray-200 lg:hidden">
      <!-- Sidebar toggle, controls the 'sidebarOpen' sidebar state. -->
      <button class="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500 lg:hidden">
        <span class="sr-only">Open sidebar</span>
        <!-- Heroicon name: menu-alt-1 -->
        <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16" />
        </svg>
      </button>
      <div class="flex-1 flex justify-between px-4 sm:px-6 lg:px-8">
        <div class="flex-1 flex">
          <form class="w-full flex md:ml-0" action="#" method="GET">
            <label for="search_field" class="sr-only">Search</label>
            <div class="relative w-full text-gray-400 focus-within:text-gray-600">
              <div class="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                <!-- Heroicon name: search -->
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
                </svg>
              </div>
              <input id="search_field" name="search_field" class="block w-full h-full pl-8 pr-3 py-2 border-transparent text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-transparent focus:placeholder-gray-400 sm:text-sm" placeholder="Search" type="search">
            </div>
          </form>
        </div>
        <div class="flex items-center">
        </div>  
      </div>
    </div>
    <main class="flex-1 relative z-0 overflow-y-auto focus:outline-none" tabindex="0">
      <!-- Page title & actions -->
      <div class="border-b border-gray-200 px-4 py-4 sm:flex sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div class="flex-1 min-w-0">
          <h1 class="text-lg font-medium leading-6 text-gray-900 sm:truncate">
            {{ collection.ftp.label }}
          </h1>
        </div>
        <div class="mt-4 flex sm:mt-0 sm:ml-4">      
          
        </div>
      </div>

      <!-- Projects list (only on smallest breakpoint) -->
      <div class="mt-0 sm:hidden">
        <div class="px-4 sm:px-6">
          <h2 class="text-gray-500 text-xs font-medium uppercase tracking-wide">Items</h2>
        </div>
        <ul class="mt-3 border-t border-gray-200 divide-y divide-gray-100">
          <li v-for="item in items" v-bind:key="item['@id']">
            <a href="#" class="group flex items-center justify-between px-4 py-4 hover:bg-gray-50 sm:px-6">
              <span class="flex items-center truncate space-x-3">
                <span class="w-2.5 h-2.5 flex-shrink-0 rounded-full bg-pink-600" aria-hidden="true"></span>
                <span class="font-medium truncate text-sm leading-6">
                  {{ item.label }}
                  <span class="truncate font-normal text-gray-500">in Engineering</span>
                </span>
              </span>
              <!-- Heroicon name: chevron-right -->
              <svg class="ml-4 h-5 w-5 text-gray-400 group-hover:text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
              </svg>
            </a>
          </li>

          <!-- More items... -->
        </ul>
      </div>

      <!-- Projects table (small breakpoint and up) -->
      <div class="hidden mt-0 sm:block">
        <div class="align-middle inline-block min-w-full border-b border-gray-200">
          <table class="min-w-full">
            <thead>
              <tr class="border-t border-gray-200">
                <th class="relative flex justify-start items-center px-6 py-1 h-12 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input @click="toggleSelectAll()"                       
                          type="checkbox" 
                          class="focus:ring-indigo-500 h-4 w-4 ml-2 mr-4 text-indigo-600 border-gray-300 rounded">
                  <div v-show="selected.length > 0"
                       class="">
                    <button v-on:click="exportSelected(false)"
                            type="button" 
                            class="order-0 inline-flex items-center px-2 py-1 mr-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-900 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:order-1">
                      Export
                    </button> 
                    <button v-on:click="exportSelected(true)"
                            type="button" 
                            class="order-0 inline-flex items-center px-2 py-1 mr-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-900 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:order-1">
                      Download Images
                    </button>                   
                    <button v-show="activeFolder"
                            v-on:click="removeItemsFromFolder()"
                            type="button" 
                            class="order-0 inline-flex items-center px-2 py-1 mr-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-900 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:order-1">
                      Remove
                    </button>
                    <div v-show="Object.keys(folders).length > 0"
                         class="inline-block">
                      <select @change="addItemsToFolder($event)"
                              id="assign-folders" 
                              name="folder" 
                              class="max-w-sm inline-block focus:ring-indigo-500 focus:border-indigo-500 w-full shadow-sm sm:max-w-xs sm:text-xs border-gray-300 rounded-md">
                        <option value="">-- Add to folder --</option>
                        <option v-for="(folder, index) in folders" v-bind:key="index" v-bind:value="folder.name"
                                class="text-sm">
                          {{ folder.name }}
                        </option>
                      </select>
                    </div>
                  </div>
                  <span class="lg:pl-2"></span>
                </th>
                <th class="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Completed
                </th>
                <th class="hidden md:table-cell px-6 py-3 border-b border-gray-200 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  
                </th>
                <th class="pr-6 py-3 border-b border-gray-200 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-100">
              <tr v-for="item in items" v-bind:key="item['@id']">
                <td class="px-6 py-3 max-w-0 w-full whitespace-nowrap text-sm font-medium text-gray-900">
                  <div class="flex items-center space-x-3 lg:pl-2">
                    <div class="relative flex items-start">
                      <div class="flex items-center h-5">
                        <input v-bind:id="item['@id']" 
                               v-model="selected" 
                               v-bind:value="item['@id']" 
                               type="checkbox" 
                               class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded">
                      </div>
                      <div class="ml-3 text-sm">
                        <label v-bind:id="item['@id']" 
                               class="font-medium text-gray-700 truncate hover:text-gray-600">
                            <span>
                                {{ item['label'] }}                            
                            </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-3 text-sm text-gray-500 font-medium">
                  <div class="flex items-center space-x-2">
                    <div class="flex flex-shrink-0 -space-x-1">
                        <span>
                            {{ item.service.pctComplete }}%
                        </span>
                    </div>
                  </div>
                </td>
                <td class="hidden md:table-cell px-6 py-3 whitespace-nowrap text-sm text-gray-500 text-right items-center">
                  <div class="relative flex justify-end items-center">
                    <button v-on:click="viewPages(item['@id'])"
                            type="button" 
                            class="order-0 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:order-1 sm:ml-3">
                        Show Pages
                    </button>
                    <button v-on:click="openExternalLink(item)" 
                            type="button"
                            target="FromThePage"
                            class="order-0 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 sm:order-1 sm:ml-3">
                        <svg class="h-5 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </button>
                  </div>
                </td>
                <td class="pr-6">
                  <div class="relative flex justify-end items-center">
                    
                  </div>
                </td>
              </tr>

              <!-- More items... -->
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>
</div>

<!-- This example requires Tailwind CSS v2.0+ -->
<div v-if="activeItem.hasOwnProperty('sequences')"
     class="fixed inset-0 overflow-hidden">
  <div class="absolute inset-0 overflow-hidden">
    <section class="absolute inset-y-0 right-0 pl-10 max-w-full flex sm:pl-16" aria-labelledby="slide-over-heading">
      <!--
        Slide-over panel, show/hide based on slide-over state.

        Entering: "transform transition ease-in-out duration-500 sm:duration-700"
          From: "translate-x-full"
          To: "translate-x-0"
        Leaving: "transform transition ease-in-out duration-500 sm:duration-700"
          From: "translate-x-0"
          To: "translate-x-full"
      -->
      <div class="w-screen max-w-md">
        <div class="h-full flex flex-col bg-white shadow-xl overflow-y-scroll">
          <div class="p-6">
            <div class="flex items-start justify-between">
              <h2 id="slide-over-heading" class="text-lg font-medium text-gray-900">
                {{ activeItem.label }}
              </h2>
              <div class="ml-3 h-7 flex items-center">
                <button @click="activeItem = {}"
                        class="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:ring-2 focus:ring-indigo-500">
                  <span class="sr-only">Close panel</span>
                  <!-- Heroicon name: x -->
                  <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <ul class="divide-y divide-gray-200 overflow-y-auto">
            <li v-for="page in activeItem.sequences[0].canvases" v-bind:key="page['@id']"
                class="px-6 py-5 relative">
              <div class="group flex justify-between items-center">
                <a href="#" class="-m-1 p-1 block">
                  <div class="absolute inset-0 group-hover:bg-gray-50" aria-hidden="true"></div>
                  <div class="flex-1 flex items-center min-w-0 relative">
                    <span class="flex-shrink-0 inline-block relative">
                      <img class="h-10 w-10 rounded-full" 
                           v-bind:src="page.images[0].resource['@id']" 
                           alt="">
                    </span>
                    <div class="ml-4 truncate">
                      <p class="text-sm font-medium text-gray-900 truncate">{{ page.label}}</p>
                    </div>
                  </div>
                </a>
                <div class="ml-2 relative inline-block text-left">
                 
                </div>
              </div>
            </li>            
          </ul>
        </div>
      </div>
    </section>
  </div>
</div>

<!-- This example requires Tailwind CSS v2.0+ -->
<div v-show="showSettings"
     class="fixed z-10 inset-0 overflow-y-auto">
  <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
    <!--
      Background overlay, show/hide based on modal state.

      Entering: "ease-out duration-300"
        From: "opacity-0"
        To: "opacity-100"
      Leaving: "ease-in duration-200"
        From: "opacity-100"
        To: "opacity-0"
    -->
    <div class="fixed inset-0 transition-opacity" aria-hidden="true">
      <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
    </div>

    <!-- This element is to trick the browser into centering the modal contents. -->
    <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
    <!--
      Modal panel, show/hide based on modal state.

      Entering: "ease-out duration-300"
        From: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        To: "opacity-100 translate-y-0 sm:scale-100"
      Leaving: "ease-in duration-200"
        From: "opacity-100 translate-y-0 sm:scale-100"
        To: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
    -->
    <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6" role="dialog" aria-modal="true" aria-labelledby="modal-headline">
      <div>
        <div class="mt-3 sm:mt-5">
          <h3 class="text-lg text-center leading-6 font-medium text-gray-900" id="modal-headline">
           Settings
          </h3>
          <div class="mt-2 space-y-6 sm:space-y-5">
            <div>
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                From the Page
              </h3>
            </div>
            <div class="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:border-b-2 sm:py-5">
              <label for="first_name" class="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                IIIF API URL
              </label>
              <div class="mt-1 sm:mt-0 sm:col-span-2">
                <input v-model="newCollection.ftp['@id']"
                       type="text" name="ftp_url" id="ftp_url" 
                       class="max-w-lg block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md">
              </div>
            </div>
          </div>
          <div class="mt-2 space-y-6 sm:space-y-5">
            <div>
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                Omeka
              </h3>
              <div class="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:pt-5">
                <label for="first_name" class="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                  URL
                </label>
                <div class="mt-1 sm:mt-0 sm:col-span-2">
                  <input v-model="newCollection.omeka.url"
                        type="text" name="omeka_url" id="omeka_url" 
                        class="max-w-lg block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md">
                </div>
              </div>              
              <p v-show="newCollection.omeka.url"
                 class="mt-1 max-w-2xl text-sm text-gray-500">              
                <a v-on:click="openExternalLink(apiUrl)"
                   href="#"
                   class="text-indigo-800 hover:text-indigo-600 hover:underline"
                   >
                   Create a new API key
                </a>
              </p>
            </div>
            <div v-show="newCollection.omeka.url"
                  class="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">              
              <label for="location" class="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">Site</label>
              <div class="mt-1 sm:mt-0 sm:col-span-2">
                <select v-model="newCollection.omeka.site_id"
                        id="site_id" 
                        name="site_id" 
                        class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                  <option v-for="site in sites" v-bind:value="site.id" v-bind:key="site.id">
                    {{ site.title }}
                  </option>
                </select>
              </div>              
            </div>
            <div class="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
              <label for="first_name" class="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                Key Indentity
              </label>
              <div class="mt-1 sm:mt-0 sm:col-span-2">
                <input v-model="newCollection.omeka.key_identity"
                       type="text" name="key_identity" id="key_identity" 
                       class="max-w-lg block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md">
              </div>
            </div>
            <div class="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start">
              <label for="first_name" class="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                Key Credential
              </label>
              <div class="mt-1 sm:mt-0 sm:col-span-2">
                <input v-model="newCollection.omeka.key_credential"
                       type="text" name="key_credential" id="key_credential" 
                       class="max-w-lg block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md">
              </div>
            </div>
          </div>
        </div>
      </div>
      <div @click="saveSettings()" 
           class="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
        <button type="button" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm">
          Save
        </button>
        <button @click="showSettings = false"
                type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm">
          Cancel
        </button>
      </div>
    </div>
  </div>
</div>



</div>

</template>

<script>
const axios = require('axios').default;
const { ipcRenderer } = window.require('electron');

export default {
  name: 'Items',
  props: {
    msg: String
  },
  data () {
    return {
      showSettings: false,
      newCollection: {
        ftp: {
          '@id': null,
          label: null,
        },
        omeka: {
          url: '',
          site_id: null,
          key_identity: null,
          key_credential: null
        }
      },
      collection: {
        ftp: {
          '@id': null,
          label: null,
        },
        omeka: {
          url: null,
          site_id: null,
          key_identity: null,
          key_credential: null
        }
      },
      settings: {   
        collections: []
      },
      key_identity: '',
      key_credential: '',
      selectAll: false,
      activeFolder: null,
      showAddFolder: false,
      newFolderName: '',
      allItems: [],
      items: [],    
      selected: [],
      completed: false,
      q: null,
      activeItem: {},
      folders: [],
      sites: []
    }
  },
  watch: {
    q(){
      this.activeFolder = null;
    },
    collection: {
      handler(data){
        if(data.omeka.url !== null){
          axios
            .get(data.omeka.url.replace(/\/+$/, '') + '/api/sites')
            .then(response => {
              this.sites = response.data.map(site => { return {id: site['o:id'], title: site['o:title']};}); 
            });
        }
      },
      deep: true
    }
  },
  mounted () { 
   
    ipcRenderer.on('updateFolders', async (event, folders) => {      
      this.folders = folders || {};  
    });

    ipcRenderer.on('updateSettings', async (event, settings) => {   
      this.settings = settings || {};  
      if((! Object.prototype.hasOwnProperty.call(this.settings, 'collections')) || (this.settings.collections.length < 1)){
        this.showSettings = true;
      }else{
        this.collection = this.settings.collections[0];
        ipcRenderer.send('setCurrentCollection', this.collection);        
        axios
          .get(this.collection.ftp['@id'])
          .then(response => {
            this.allItems = response.data.manifests;
            this.items = this.allItems;
            ipcRenderer.send('sync', this.allItems); 
          });
      }
    });
       
    ipcRenderer.on('downloadComplete', async (event, data) => {      
      console.log(data.message);  
    });   
    
  },

  computed: {
    apiUrl: function() {
      return this.collection.omeka.url.replace(/\/+$/, '') + '/admin/user';
    }
  },

  methods: {
      toggleSelectAll: function() {
        this.selectAll = ! this.selectAll;
        if(this.selectAll){
          // TODO: selectAll
          this.selected = this.items.map(manifest => { return manifest['@id'] });
        }else{ 
          this.selected = []; 
        }        
      },
      showCompleted: function() {
        this.completed = true;
        this.items = this.items.filter( item => { return item.service.pctComplete == 100 });
      },      
      showAll: function() {
        this.q = null;
        this.activeFolder = null;
        this.completed = false;
        this.items = this.allItems;
      },      
      search: function() {
        this.items = this.allItems.filter( item => { return item.label.toUpperCase().indexOf(this.q.toUpperCase()) > -1 });
      },      
      updateSelected: function() {
        ipcRenderer.send('update', this.selected);          
      },      
      exportSelected: function(images) {
        ipcRenderer.send('export', this.selected, images);          
      },
      createPages: function() {
        //readCsv();
      },
      viewPages: function(url) {
        axios
          .get(url)
          .then(response => { 
              this.activeItem = response.data;
          });
      },
      openExternalLink: function(item) {
        if(typeof item === 'string'){
          ipcRenderer.send('openExternalLink', item);
        }else{
          axios
            .get(item['@id'])
            .then(response => { 
              ipcRenderer.send('openExternalLink', response.data.related[0]['@id']);
            });
        }        
      },
      createNewFolder: function(){
        ipcRenderer.send('createNewFolder', this.newFolderName);
        //this.folders[this.newFolderName] = { name: this.newFolderName };
        this.showAddFolder = false;
        this.newFolderName = '';       
      },
      showFolder: function(folder) {
        this.activeFolder = folder;
        this.items = this.allItems.filter( item => { return folder.manifests.indexOf(item['@id']) > -1 });
      },
      addItemsToFolder: function(event){
        if(event.target.value){
          ipcRenderer.send('addItemsToFolder', event.target.value, this.selected);
          this.selected = [];
        }         
      },      
      removeItemsFromFolder: function(){
        ipcRenderer.send('removeItemsFromFolder', this.activeFolder.name, this.selected);
        this.items = this.items.filter( item => { return ! (this.selected.indexOf(item['@id']) > -1) });
        this.selected = []; 
      },      
      createOmekaPages: function(){
        ipcRenderer.send('createOmekaPages');
      },      
      saveSettings: function(){
        //ipcRenderer.send('saveSettings', newCollection);
        this.showSettings = false;  
        axios
          .get(this.newCollection.ftp['@id'])
          .then(response => {
            this.newCollection.ftp.label = response.data.label
            this.collection = this.newCollection;
            this.allItems = response.data.manifests;
            this.items = this.allItems;
            ipcRenderer.send('addCollection', this.newCollection);
            ipcRenderer.send('sync', this.allItems);  
          });  
      }
  }
}


</script>