class SuggestCompany extends HTMLElement {
    connectedCallback () {
        this.template = suggestCompanyTmpl.content.cloneNode(true)
        this.attachShadow({mode: 'open'}).append(this.template)
        
        // Methods
        this.fetchSuggestsDebounce = debounce(this.fetchSuggests, 500)
        
        // Variables
        this.isShowSuggests = false
        this.currentIndex = null
        this.arraySuggests = []
        this.prevSuggest = null

        // Events
        this.shadowRoot.querySelector('#party').addEventListener('input', this.inputSuggest)
        this.shadowRoot.querySelector('#party').addEventListener('focus', this.inputSuggest)
        this.shadowRoot.querySelector('#party').addEventListener('keydown', this.selectSuggest)
        this.shadowRoot.addEventListener('click', this.handleClickVariant)
        document.addEventListener('click', (e) => {
            if(!e.path.some(el => el == this)) {
                this.setVisibleSuggestsList(false)
            }  
        })
    }

    inputSuggest = (e) => {
        const query = e.currentTarget.value

        if(query === this.prevSuggest && this.arraySuggests && this.arraySuggests.length > 1) {
            this.renderSuggestList(this.arraySuggests)
        } else {
            this.fetchSuggestsDebounce(query)
        }
    }

    fetchSuggests = async (query) => {
        // Замените на свой API-ключ
        const token = '5a4dd6f0db4a97283eff4aa376df0c657b879b46',
        url = 'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party?count=5',
        options = {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Token ' + token,
                'count': 5,
            },
            body: JSON.stringify({
                query: query,
                count: 5,
            })
        }

        if (query.length < 1) {
            this.setVisibleSuggestsList(false)
            return
        }


        try {
            const response = await fetch(url, options)
            const result = await response.json()
            this.renderSuggestList(result.suggestions)
            this.prevSuggest = query
        } catch(e) {
            console.log(e)
        }
    
    }

    renderSuggestList (items) {
        const $list = this.shadowRoot.querySelector('#suggests_list')
        this.arraySuggests = []

        $list.innerHTML = ''
        $list.insertAdjacentHTML('beforeend', '<label for="party"><div class="suggests_title" disabled>Выберите вариант или продолжите ввод</div></label>')

        items.forEach((el, index) => {
            const data = el.data
            this.arraySuggests[index] = el

            $list.insertAdjacentHTML('beforeend', 
                `<div class='variant' data-val=${index}>
                    <div class='variant_value'>${el.value}</div>
                    <div class='variant_bottom'>
                        <span class='variant_inn'>${data.inn}</span>
                        <span class='variant_adsress'>${data.address.value}</span>
                    </div>
                </div>`
            )
        })

        if(!this.arraySuggests.length) {
            this.setVisibleSuggestsList(false)
            return
        }

        this.setVisibleSuggestsList(true)
    }

    selectSuggest = (e) => {
        if(!this.isShowSuggests) return

        const UP_KEY = 38, DOWN_KEY = 40, ENTER_KEY = 13, ESC_KEY = 27;
        const variants = this.shadowRoot.querySelectorAll('.variant')

        switch(e.keyCode) {
            case UP_KEY: 
                if(this.currentIndex === null) this.currentIndex = this.arraySuggests.length - 1
                else this.currentIndex = this.currentIndex - 1 < 0 ? this.arraySuggests.length - 1 : this.currentIndex - 1

                variants.forEach((el, index) => {
                    if(el.getAttribute('data-val') == this.currentIndex) {
                        el.classList.add('selected')
                    }
                    else(
                        el.classList.remove('selected')
                    )
                })

                break;
            case DOWN_KEY:
                if(this.currentIndex === null) this.currentIndex = 0
                else this.currentIndex = this.currentIndex + 1 === this.arraySuggests.length ? 0 : this.currentIndex + 1
                
                variants.forEach((el, index) => {
                    if(el.getAttribute('data-val') == this.currentIndex) {
                        el.classList.add('selected')
                    }
                    else(
                        el.classList.remove('selected')
                    )
                })

                break;
            case ENTER_KEY:
                this.enterSuggest(this.currentIndex)    
                this.setVisibleSuggestsList(false)

                break;
            case ESC_KEY: 
                this.setVisibleSuggestsList(false)

                break;
        }
    }

    enterSuggest = (index) => {
        const data = this.arraySuggests[index].data,
              $nameShort = this.shadowRoot.querySelector('#name_short'),
              $nameFull = this.shadowRoot.querySelector('#name_full'),
              $innKpp = this.shadowRoot.querySelector('#inn_kpp'),
              $address = this.shadowRoot.querySelector('#address')

        $nameShort.value =  data.name.short_with_opf || data.name.short || ''
        $nameFull.value = data.name.full_with_opf || data.name.full || ''
        $innKpp.value = [data.inn, data.kpp].join(' / ')
        $address.value =  data.address.data.source || ''

        this.setVisibleSuggestsList(false)
    }

    handleClickVariant = (e) => {
        const variant =  e.target.closest('.variant')
            if(!variant) return
            this.enterSuggest(variant.getAttribute('data-val'))
    }

    setVisibleSuggestsList = (show = false) => {
        const $list = this.shadowRoot.querySelector('#suggests_list')
    
        if(show) {
            $list.classList.remove('hidden')
            this.isShowSuggests = true
        } else {
            $list.classList.add('hidden')
            this.isShowSuggests = false
            this.currentIndex = null
        }
    }
}

customElements.define('suggests-company', SuggestCompany);

// modules in real world =)
function debounce (fn, ms) {
    let timeout;
    return function () {
      const fnCall = () => { fn.apply(this, arguments) }
      clearTimeout(timeout);
      timeout = setTimeout(fnCall, ms)
    };
}