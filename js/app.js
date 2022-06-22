let estadoURL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json"
let poblacion = 'apportionment.csv'
let fids = 'fids.json'

let estadoData
let poblacionData
let fid
let pop = []
//para referenciar svg con id = canvas
let canvas = d3.select("#canvas")
let tooltip = d3.select("#tooltip")

const color = d3
    .scaleLog()
    .range(["#B3E5FC", "#01579B"])

//genera los paths del mapa
const path = canvas.selectAll("path")

//genera el texto de los ticks
const texto = canvas.append("g")
                    .attr("class", "axis")  //Assign "axis" class
                    .attr("transform", "translate(" + 300 + "," + 20 + ")")
 //se crea el rectangulo para la layenda y se llena con los colores en uso
canvas.append("rect")
    .attr("width", 300)
    .attr("height", 20)
    .attr("transform", "translate(" + 300 + "," + 0 + ")")
    .style("fill", "url(#linear-gradient)")

//Escala para la leyenda
var xScale = d3.scaleLinear()
     .range([0, 300])
//Ticks en la leyenda
var xAxis = d3.axisBottom()
          .ticks(5)

 //Se dice en que color inicia y acaba la leyenda
var defs = canvas.append("defs");
// se crea el linearGradient que nos sirve para rellenar el rect de la leyenda
var linearGradient = defs.append("linearGradient")
    .attr("id", "linear-gradient");
//color al 0%
linearGradient.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", "#B3E5FC")
    .enter().append("stop"); 
//Color al (100%)
linearGradient.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "#01579B"); //dark blue

// Range steps
const steps = [
    "1910",
    "1920",
    "1930",
    "1940",
    "1950",
    "1960",
    "1970",
    "1980",
    "1990",
    "2000",
    "2010",
    "2020",
]

const stepsOutput = document.getElementById('steps-output-element')
const stepsRange = document.getElementById('steps-range-element')
let year = '1910'
stepsOutput.innerText='1910'
stepsRange.addEventListener("change", evt => {
    const value = evt.target.value

    const stepInRange = Math.round(((steps.length - 1) / 1000) * value);
    const selectedStep = steps[stepInRange];
    stepsOutput.innerText = selectedStep
    year = selectedStep
    // document.getElementById("canvas").innerHTML=""
    dibuja()
})



const drawMap = () => {
    //color basado en el numero de habitantes
    color.domain([d3.min(pop), d3.max(pop)])
    
 //leyenda

    //se empieza a dibujar el mapa, agregando los paths, geoPath convierte el path a geojson
    path.remove()
        .data(estadoData)
        .enter()
        .append("path")
        .attr("d", d3.geoPath()) // d:el conjunto de coordenadas
        .attr("class", "estado")
        .attr("fill", (estadoDataItem => {
            let id = estadoDataItem['id']
            let fid_estado = fid[id.toString()]
            //console.log(fid_estado)
            let estado = poblacionData.find((item) => {
                return (item['Name'] === fid_estado & (item['Year'] === year))
            })
         
            //se convierte a entero para manejar el numero de habitantes
            let habitantes = parseInt(estado['Resident Population'].replace(/,/g, ""));

            return color(habitantes)
        }))
        
        //generando el tooltip
        .append("title")
        .text((d) => {
            tooltip.transition()
                .style('visibility', 'visible')
    
            let id = d['id']
        
            let fid_estado = fid[id.toString()]
  
            let estado = poblacionData.find((item) => {
                return (item['Name'] === fid_estado & (item['Year'] === year))
            })
        
            let habitantes = estado['Resident Population']
    
            return (fid_estado + "\n" + habitantes)
        })

}

let d3loadata
d3.json(estadoURL).then(
    (data, error) => {
        if (error) {
            console.log(log)
        } else {
            d3loadata = data
            dibuja()
        }
    }
)

function dibuja() {
    const data = d3loadata
    pop = []
  //  console.log(data)
    //convierte topojson a geoson formato, y solo se seleccionan los features que son los que nos dan las coor
    estadoData = topojson.feature(data, data.objects.states).features
    // lee el archivo CSV
    d3.csv(poblacion).then(
        (data, error) => {
            if (error) {
                console.log("error: " + log)
            } else {
    
                poblacionData = data
        
                Object.entries(poblacionData).forEach(([key, value]) => {
                  // se seleccionan solo los estados, el archivo contiene globales de regiones y pais
                    if (value['Year'] === year & value['Geography Type'] === 'State'){
                        pop.push(parseInt(value['Resident Population'].replace(/,/g, "")))
                         console.log('habitnates:' +parseInt(value['Resident Population'].replace(/,/g, "")))
                    }
                })
                 console.log(pop.length)
                //se lee el archivo JSON de los FIDS
                d3.json(fids).then(
                    (data, error) => {
                        if (error) {
                            console.log(error)
                        } else {
                  
                            fid = data
                            // va a la funcion de dibujar mapa
                               //leyenda
                            // se genera la escala para la leyenda
                            console.log(d3.max(pop))
                            xScale.domain([0, d3.max(pop)])

                            //console.log(xScale(2000000))

                            //Define el eje x de la leyenda

                            xAxis.tickFormat(function(d) { 
                                    return (d3.format(".1s")(d))  // se formatean los numero 

                                 })
                                .scale(xScale);


                           //se pinta el eje x con sus ticks

                            texto.call(xAxis);
                            drawMap()
                        }
                    }
                )
            }
        }
    )
}