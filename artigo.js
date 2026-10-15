function mostrarSenha() {
    const senha = document.getElementById("senha");

    if (senha.type === "password") {
        senha.type = "text";
    } else {
        senha.type = "password";
    }
}

const articles = [

    {
        title: "Como amamentar seu bebê",
        category: "Amamentação",
        description:
            "Informações gerais sobre amamentação e cuidados durante esse período.",
        image: "./img/amamentacao.jpeg",
        link: "https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/a/aleitamento-materno"
    },

    {
        title: "Entendendo o sono do bebê",
        category: "Sono",
        description:
            "Conheça alguns aspectos importantes sobre o sono durante os primeiros meses.",
        image: "./img/sono.jpg",
        link: "https://institutonascer.com.br/fisiologia-do-sono-infantil-entender-para-respeitar-entender-para-nao-atrapalhar/"
    },

    {
        title: "Introdução alimentar",
        category: "Alimentação",
        description:
            "Informações gerais sobre a fase de introdução dos alimentos.",
        image: "./img/alimentacao.jpg",
        link:"https://www.unicef.org/brazil/introducao-alimentar-dos-6-aos-12-meses"
    },

    {
        title: "Cuidados com o recém-nascido",
        category: "Saúde",
        description:
            "Veja informações importantes sobre os cuidados básicos com o recém-nascido.",
        image: "./img/cuidados.jpg",
        link: "https://www.gndiminas.com.br/w/blog-da-saude/10-cuidados-essenciais-com-o-bebe"
    },

    {
        title: "Vacinação do bebê",
        category: "Saúde",
        description:
            "Entenda a importância de manter a vacinação da criança atualizada.",
        image: "./img/vacina.jpg",
        link: "https://share.google/Ka1n8yVkhjrvVoIz8"
    },

    {
        title: "Rotina de alimentação",
        category: "Alimentação",
        description:
            "Informações para ajudar a compreender a rotina alimentar do bebê.",
        image: "./img/rotina.webp",
        link: "https://www.tuasaude.com/alimentacao-do-bebe-dos-0-aos-12-meses/"
    }

];


const container =
    document.getElementById("articlesContainer");

const searchInput =
    document.getElementById("searchInput");

const noResults =
    document.getElementById("noResults");

const filters =
    document.querySelectorAll(".filter");


let currentCategory = "Todos";



function renderArticles() {

    const search =
        searchInput.value.toLowerCase().trim();


    const filteredArticles =
        articles.filter(article => {

            const matchesCategory =
                currentCategory === "Todos" ||
                article.category === currentCategory;


            const matchesSearch =
                article.title
                    .toLowerCase()
                    .includes(search)

                ||

                article.description
                    .toLowerCase()
                    .includes(search);


            return matchesCategory && matchesSearch;

        });


    container.innerHTML = "";


    if (filteredArticles.length === 0) {

        noResults.style.display = "block";

        return;

    }


    noResults.style.display = "none";


    filteredArticles.forEach(article => {

        const card =
            document.createElement("article");

        card.className = "card";


        card.innerHTML = `

            <img
                class="card-image"
                src="${article.image}"
                alt="${article.title}"
            >

            <div class="card-content">

                <span class="category">
                    ${article.category}
                </span>

                <h2>
                    ${article.title}
                </h2>

                <p>
                    ${article.description}
                </p>

                <a
                    href= "${article.link}"
                    class="read-more"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Leia mais
                </a>

            </div>

        `;


        container.appendChild(card);

    });

}



// BUSCA

searchInput.addEventListener(
    "input",
    renderArticles
);



// FILTROS

filters.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            filters.forEach(btn =>
                btn.classList.remove("active")
            );

            button.classList.add("active");


            currentCategory =
                button.dataset.category;


            renderArticles();

        }
    );

});

// PRIMEIRA RENDERIZAÇÃO

renderArticles();