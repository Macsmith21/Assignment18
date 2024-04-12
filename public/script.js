const getCrafts = async () => {
    try {
      return (await fetch("api/crafts/")).json();
    } catch (error) {
      console.log(error);
    }
  };
  
  const showCrafts = async () => {
    let crafts = await getCrafts();

    const columns = [
      document.getElementById("column-1"),
      document.getElementById("column-2"),
      document.getElementById("column-3"),
      document.getElementById("column-4"),

    ];

    columns.forEach(column => column.innerHTML = "");
  
    crafts.forEach((craft, index) => {
      const section = document.createElement("section");
      section.classList.add("craft");
  
      const a = document.createElement("a");
      a.href = "#";
      section.append(a);
      
      const img = document.createElement("img");
      img.src = "/images/"+craft.img;
      a.append(img);
  
      a.onclick = (e) => {
        e.preventDefault();
        displayDetails(craft);
      };
  

      const columnIndex = index % columns.length;
      columns[columnIndex].append(section);
    });
  };
  
  const displayDetails = (craft) => {
    openDialog("craft-details");
    const craftDetails = document.getElementById("craft-details");
    craftDetails.innerHTML = "";
    craftDetails.classList.remove("hidden");
  
    const h3 = document.createElement("h3");
    h3.innerHTML = craft.name;
    craftDetails.append(h3);
  
    const dLink = document.createElement("a");
    dLink.innerHTML = "	&#9249;";
    craftDetails.append(dLink);
    dLink.id = "delete-link";
  
    const eLink = document.createElement("a");
    eLink.innerHTML = "&#9998;";
    craftDetails.append(eLink);
    eLink.id = "edit-link";
  
    const p = document.createElement("p");
    craftDetails.append(p);
    p.innerHTML = craft.description;
  
    const ul = document.createElement("ul");
    craftDetails.append(ul);
    console.log(craft.supplies);
    craft.supplies.forEach((supply) => {
      const li = document.createElement("li");
      ul.append(li);
      li.innerHTML = supply;
    });
  

    eLink.onclick = showCraftForm;
    dLink.onclick = deleteCraft.bind(this, craft);
  
    populateEditForm(craft);
  };
  
  const populateEditForm = (craft) =>{
    const form = document.getElementById("craft-form");
    form._id.value = craft._id;
    form.name.value = craft.name;
    form.description.value = craft.description;
    document.getElementById("img-prev").src = "/images/"+craft.img;
    populateSupplies(craft.supplies);
  };
  
  const populateSupplies = (supplies) => {
    const section = document.getElementById("supply-boxes");
    supplies.forEach((supply)=>{
      const input = document.createElement("input");
      input.type = "text";
      input.value = supply;
      section.append(input);
    });
  };
  
  const addEditCraft = async (e) => {
    e.preventDefault();
    const form = document.getElementById("craft-form");
    const formData = new FormData(form);
    let response;
    formData.append("supplies", getSupplies());
  
    console.log(...formData);
  
    //add request
    if (form._id.value.trim() == "") {
      console.log("in post");
      response = await fetch("/api/crafts", {
        method: "POST",
        body: formData,
      });
    } else {
      //put request
      response = await fetch(`/api/crafts/${form._id.value}`, {
        method: "PUT",
        body: formData,
      });
    }
  
    //successfully got data from server
    if (response.status != 200) {
      console.log("Error adding / editing data");
    }
  
    await response.json();
    resetForm();
    document.getElementById("dialog").style.display = "none";
    showCrafts();
  };
  
  const deleteCraft = async(craft)=> {
    let response = await fetch(`/api/crafts/${craft._id}`, {
      method:"DELETE",
      headers:{
        "Content-Type":"application/json;charset=utf-8"
      }
    });
  
    if(response.status != 200){
      console.log("Error deleting");
      return;
    }
  
    let result = await response.json();
    resetForm();
    showCrafts();
    document.getElementById("dialog").style.display = "none";
  };
  
  const getSupplies = () => {
    const inputs = document.querySelectorAll("#supply-boxes input");
    let supplies = [];
  
    inputs.forEach((input) => {
      supplies.push(input.value);
    });
  
    return supplies;
  };
  
  const resetForm = () => {
    const form = document.getElementById("craft-form");
    form.reset();
    form._id.value = "";
    document.getElementById("supply-boxes").innerHTML = "";
    document.getElementById("img-prev").src = "";
  };
  
  const showCraftForm = (e) => {
    openDialog("craft-form");
    console.log(e.target);
    if (e.target.getAttribute("id") != "edit-link") {
      resetForm();
    }
  };
  
  const addSupply = (e) => {
    e.preventDefault();
    const section = document.getElementById("supply-boxes");
    const input = document.createElement("input");
    input.type = "text";
    section.append(input);
  };
  
  const openDialog = (id) => {
    document.getElementById("dialog").style.display = "block";
    document.querySelectorAll("#dialog-details > *").forEach((item) => {
      item.classList.add("hidden");
    });
    document.getElementById(id).classList.remove("hidden");
  };
  
  //initial code
  showCrafts();
  document.getElementById("craft-form").onsubmit = addEditCraft;
  document.getElementById("add-link").onclick = showCraftForm;
  document.getElementById("add-supply").onclick = addSupply;
  
  document.getElementById("img").onchange = (e) => {
    if (!e.target.files.length) {
      document.getElementById("img-prev").src = "";
      return;
    }
    document.getElementById("img-prev").src = URL.createObjectURL(
      e.target.files.item(0)
    );
  };