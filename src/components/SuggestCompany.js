class SuggestCompany extends HTMLElement {
    connectedCallback () {
        this.template = suggestCompanyTmpl.content.cloneNode(true)
    
        this.attachShadow({mode: 'open'}).append(this.template)

        this.shadowRoot.querySelector('#party').addEventListener('input', this.inputSuggest)


    }

    inputSuggest (e) {
        console.log(e.currentTarget.value)
    }
}

customElements.define("time-formatted", SuggestCompany);