function register() {
    const campos = document.querySelectorAll(".campo input");

    for (const campo of campos) {
        if (campo.value.trim() === "") {
            alert("Todos os campos devem ser preenchidos!");
            campo.focus();
            return;
        }
    }
}