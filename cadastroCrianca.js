function register() {
    const campos = document.querySelectorAll(".campo input");

    for (const campo of campos) {
        if (campo.value.trim() === "") {
            alert("Campo obrigatório");
            campo.focus();
            return;
        }
    }

    alert("Cadastro realizado com sucesso!");

    window.location.href = "login.html";
}

const checkbox = document.getElementById("minhaCaixa");

function register() {
    const campos = document.querySelectorAll(".campo input");
    const checkbox = document.getElementById("minhaCaixa");

    // Se o checkbox NÃO estiver marcado, valida os campos
    if (!checkbox.checked) {
        for (const campo of campos) {
            if (campo.value.trim() === "") {
                alert("Campo obrigatório");
                campo.focus();
                return;
            }
        }
    }

    alert("Cadastro realizado com sucesso!");

    window.location.href = "login.html";
}