class SuggestCompany extends HTMLElement {
    connectedCallback () {
        this.template = suggestCompanyTmpl.content.cloneNode(true)
        this.attachShadow({mode: 'open'}).append(this.template)
        this.shadowRoot.querySelector('#party').addEventListener('input', this.inputSuggest)
    }

    inputSuggest = (e) => {
        this.fetchSuggests(e.currentTarget.value)
    }

    fetchSuggests = async (query) => {
        const url = 'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party'
        const token = '5a4dd6f0db4a97283eff4aa376df0c657b879b46'

        var options = {
            method: "POST",
            mode: "cors",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": "Token " + token
            },
            body: JSON.stringify({query: query})
        }

        try {
            const response = await fetch(url, options)
            const result = await response.json()
            console.log(result)
        } catch(e) {
            console.log(e)
        }
        
    }
}

customElements.define("time-formatted", SuggestCompany);