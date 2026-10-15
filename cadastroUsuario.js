function mostrarSenha() {
    const senha = document.getElementById("senha");

    if (senha.type === "password") {
        senha.type = "text";
    } else {
        senha.type = "password";
    }
}

function register() {
    const campos = document.querySelectorAll(".campo input");

    for (const campo of campos) {
        if (campo.value.trim() === "") {
            alert("Todos os campos devem ser preenchidos!");
            campo.focus();
            return;
        }
    }

    window.location.href = "cadastroResponsavel.html";
}