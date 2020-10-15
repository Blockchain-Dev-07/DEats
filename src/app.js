App = {
  loading: false,
  contracts: {},

  load: async () => {
    await App.loadWeb3()
    await App.loadAccount()
    await App.loadContract()
    await App.render()
  },

  // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
  loadWeb3: async () => {
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider
      web3 = new Web3(web3.currentProvider)
    } else {
      window.alert("Please connect to Metamask.")
    }
    // Modern dapp browsers...
    if (window.ethereum) {
      window.web3 = new Web3(ethereum)
      try {
        // Request account access if needed
        await ethereum.enable()
        // Acccounts now exposed
        web3.eth.sendTransaction({/* ... */})
      } catch (error) {
        // User denied account access...
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = web3.currentProvider
      window.web3 = new Web3(web3.currentProvider)
      // Acccounts always exposed
      web3.eth.sendTransaction({/* ... */})
    }
    // Non-dapp browsers...
    else {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  },

  loadAccount: async () => {
    // Set the current blockchain account
    App.account = web3.eth.accounts[0]
  },

  loadContract: async () => {
    // Create a JavaScript version of the smart contract
    const restaurantfns = await $.getJSON('Restaurantfns.json')
    App.contracts.restaurantfns = TruffleContract(restaurantfns)
    App.contracts.restaurantfns.setProvider(App.web3Provider)

    // Hydrate the smart contract with values from the blockchain
    App.restaurantfns = await App.contracts.restaurantfns.deployed()
  },

  render: async () => {
    // Prevent double render
    if (App.loading) {
      return
    }

    // Update app loading state
    App.setLoading(true)

    // Render Account
    $('#account').html(App.account)

    // Render Tasks
    await App.renderRestaurants()

    // Update loading state
    App.setLoading(false)
  },

  renderRestaurants: async () => {
    // Load the total task count from the blockchain
    const resCount = await App.restaurantfns.res_count()
    const $resTemplate = $('.resTemplate')//html part div tag

    // Render out each task with a new task template
    for (var i = 1; i <= resCount; i++) {
      // Fetch the task data from the blockchain
      const res = await App.restaurantfns.restaurants(i)
      const resId = res[0].toNumber()
      const resname = res[1]
      const availability = res[2]

      // Create the html for the task
      const $newResTemplate = $resTemplate.clone()  //create div tag instance
      $newResTemplate.find('.content').html(resname)
      $newResTemplate.find('input')
                      .prop('name', resId)
                      .prop('checked', availability)
                      .on('click', App.Res_not_opened)

      // Put the res in the correct list
      if (availability) {
        $('#Resclosed').append($newResTemplate)
      } else {
        $('#Resopened').append($newResTemplate)
      }

      // Show the task ---- visibility
      $newResTemplate.show()
    }
  },

  Add_res: async () => {
    App.setLoading(true)
    const content = $('#newRes').val()
    await App.restaurantfns.add_restaurant(content)
    window.location.reload()
  },


  //event related functionalities

  Res_not_opened: async (e) => {
    App.setLoading(true)
    const resId = e.target.name
    await App.restaurantfns.Res_not_opened(resId)
    window.location.reload()
  },

// Loading or show content
  setLoading: (boolean) => {
    App.loading = boolean
    const loader = $('#loader')
    const content = $('#content')
    if (boolean) {
      loader.show()
      content.hide()
    } else {
      loader.hide()
      content.show()
    }
  }
}

$(() => {
  $(window).load(() => {
    App.load()
  })
})
