import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

export default function Cart() {
    // const cart = { 1: { quantity: 1 }, 2: { quantity: 5 }, 3: { quantity: 6 } }
    const navigate = useNavigate();
    const [cartDetails, setCartDetails] = useState({})

    async function getProductDetails() {
        let updatedCart = {}
        let cart = {}
        try{
            const response = await axios.get("https://best-store-api-77f5ba459c2e.herokuapp.com/cart", { withCredentials: true })
            if (response.status === 200) {
                cart = response.data
            }
        } catch (error) {
            console.log(error);
        }
        console.log("Cart", cart)
        let promise = Object.entries(cart.cart).map(async entry => {
            try {
                const response = await axios.get(`https://best-store-api-77f5ba459c2e.herokuapp.com/product/${entry[0]}`);
                if (response.status === 200) {
                    updatedCart[entry[0]] = { ...entry[1], ...response.data }
                }
            } catch (error) {
                console.log(error);
            }
        });
        await Promise.all(promise);
        setCartDetails(updatedCart)
        // console.log("Cart Details", cartDetails)
    }
    useEffect(() => {
        getProductDetails()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    console.log("Cart Details", cartDetails)
    async function quantityOnChange(e) {
        const quantity = parseInt(e.target.value);
        const id = parseInt(e.target.name);
        const form_data = new FormData();
        form_data.append("id", id)
        form_data.append("quantity", quantity)
        try {
            const res = await axios.post("https://best-store-api-77f5ba459c2e.herokuapp.com/cart/add", form_data, { withCredentials: true })
            if (res.status === 200) {
                getProductDetails()
            }else{
                alert("Something went wrong")
            }
        } catch (error) {
            console.log(error);
        }
    }
    async function checkedOnChange(e) {
        const id = parseInt(e.target.name);
        const checked = e.target.checked ? 1 : 0
        const form_data = new FormData();
        form_data.append("id", id)
        form_data.append("quantity", cartDetails[id].quantity)
        form_data.append("checked", checked)
        try {
            const res = await axios.post("https://best-store-api-77f5ba459c2e.herokuapp.com/cart/add", form_data, { withCredentials: true })
            if (res.status === 200) {
                getProductDetails()
            }else{
                alert("Something went wrong")
            }
        } catch (error) {
            console.log(error);
        }
    }
    async function deleteProduct(id){
        try{
            const res = await axios.delete(`https://best-store-api-77f5ba459c2e.herokuapp.com/cart/delete/${id}`, { withCredentials: true })
            if (res.status === 200) {
                getProductDetails()
            }else if(res.status === 401){
                alert("Unauthorized")
            }else{
                alert("Something went wrong")
            }
        } catch (error) {
            console.log(error);
        }
    }
    return (
        <div className="container my-4">
            {Object.keys(cartDetails).length > 0 ? <div className="border rounded p-4">
                <h3>Shopping Cart</h3>
                <hr />
                {Object.entries(cartDetails).map(entry => {
                    return (
                        <div className="row align-items-center" style={{'min-height':"250px"}} key={entry[0]} >
                            <div className="col-md-1 align-items-center" >
                                <input type="checkbox" name={cartDetails[entry[0]].id} defaultChecked={entry[1].checked == 1} onClick={checkedOnChange}/>
                            </div>
                            <div className="col-md-11" style={entry[1].checked == 0 ? { filter: 'blur(1px)' } : {}}>
                                <div className="row my-3" >
                                    <div className="col-md-2">
                                        <img src={"https://best-store-api-77f5ba459c2e.herokuapp.com/images/" + entry[1].imageFilename} alt="..." className="img-fluid" width={150} />
                                    </div>
                                    <div className="col-md-6 px-3">
                                        <h5>{entry[1].name}</h5>
                                        <p>{entry[1].description.substring(0, 200) + "..."}</p>
                                    </div>
                                    <div className="col-md-2 text-center">
                                        <h5>{entry[1].price}$</h5>
                                    </div>
                                    <div className="col-md-2 align-items-center text-center">
                                        <div className="d-flex mb-2  justify-content-center text-center">
                                            <h5 className="me-2 pt-2">Qty:</h5>
                                            <input className={` form-control p-1 me-1`} name={`${entry[1].id}`} type="number" step={1} min={1} defaultValue={cartDetails[entry[0]].quantity} onChange={quantityOnChange} style={{ width: "50px" }} />
                                        </div>
                                            <button className="btn btn-outline-danger btn-md my-1" onClick={() => deleteProduct(cartDetails[entry[0]].id)}>Delete</button>
                                            <button className="btn btn-outline-primary btn-md ms-2 my-1">Share</button>
                                            <button className="btn btn-outline-success btn-md ms-2 my-1" onClick={() => navigate(`/products/${entry[1].id}`)}>View Product</button>
                                    </div>
                                </div>
                            </div>
                            <hr />
                        </div>
                    )
                })}
                <div className="row">
                    <div className="col-md-6">
                        <big className="pt-4"><span className="fw-bold me-2 ">{`SubTotal (${Object.keys(cartDetails).length} items)`}:</span>{`${Object.values(cartDetails).reduce((acc, curr) => acc + (curr.checked == 1 ?curr.price * curr.quantity : 0 ), 0)} $`}</big>
                    </div>
                    <div className="col-md-6 text-end">
                            <button className="btn btn-warning btn-md" onClick={() => navigate("/user/checkout")}>Proceed to checkout</button>
                    </div>
                </div>

            </div> 
        : <div className="border rounded p-4">
                <h3>Your Shopping Cart is Empty !!</h3>
            </div> }
        </div>

    )
}
