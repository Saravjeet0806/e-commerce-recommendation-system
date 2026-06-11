document
.getElementById("registerForm")
.addEventListener("submit", async (e)=>{

    e.preventDefault();

    const response = await fetch(
        "/api/register",
        {
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                name:name.value,
                email:email.value,
                password:password.value
            })
        }
    );

    const data = await response.json();

    alert(data.message);

    if(data.success){
        location.href="login.html";
    }
});