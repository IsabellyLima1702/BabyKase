function register() {
    const campos = document.querySelectorAll(".campo input");

    for (const campo of campos) {
        if (campo.value.trim() === "") {
            alert("Campo obrigatório");
            campo.focus();
            return;
        }
    }

    alert("Todos os campos foram preenchidos!");
}

function register() {
    const campos = document.querySelectorAll(".campo input");

    for (const campo of campos) {
        if (campo.value.trim() === "") {
            alert("Campo obrigatório");
            campo.focus();
            return;
        }
    }

    window.location.href = "cadastroCrianca.html";
}