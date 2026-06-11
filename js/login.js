document
.getElementById("loginForm")
.addEventListener("submit", async (e)=>{

    e.preventDefault();

    const response = await fetch(
        "/api/login",
        {
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            credentials:"include",
            body:JSON.stringify({
                email:email.value,
                password:password.value
            })
        }
    );

    const data = await response.json();

    alert(data.message);

    if(data.success){
        location.href="index.html";
    }
});