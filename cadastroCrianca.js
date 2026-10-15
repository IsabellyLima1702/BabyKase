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