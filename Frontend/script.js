function getBodyType(height, weight){

const bmi = weight / ((height/100)*(height/100))

if(bmi < 18.5){
return "Slim"
}

if(bmi >=18.5 && bmi <25){
return "Average"
}

if(bmi >=25 && bmi <30){
return "Athletic"
}

return "Plus"

}

async function getRecommendation(){

const height = document.getElementById("height").value
const weight = document.getElementById("weight").value
const occasion = document.getElementById("occasion").value

const bodyType = getBodyType(height,weight)
console.log("BodyType:",bodyType)
console.log("Occasion:",occasion)

const res = await fetch(`http://localhost:5000/api/outfits/recommend?bodyType=${bodyType}&occasion=${occasion}`)

const data = await res.json()
console.log("API:",data)

displayOutfits(data)

}

function displayOutfits(outfits){

const container = document.getElementById("outfits")

container.innerHTML=""

outfits.forEach(outfit=>{

const card = document.createElement("div")
card.className="card"

card.innerHTML = `
<img src="http://localhost:5000/uploads/${outfit.image}">
<h3>${outfit.top}</h3>
<p>${outfit.bottom}</p>
<p>${outfit.footwear}</p>
`

container.appendChild(card)

})

}