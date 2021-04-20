// 取得 DOM
const productList = document.querySelector('.productWrap');
const productSelect = document.querySelector('.productSelect');
const cartList = document.querySelector('.shoppingCar-tableList');

// 初始化
function init(){
    getProductList();
    getCartList()

}
init();

function combineProductHTMLItem(item){
    const content = `<li class="productCard">
            <h4 class="productType">新品</h4>
            <img src="${item.images}" alt="">
            <a href="#" class="js-addCart" id="addCardBtn" data-id="${item.id}">加入購物車</a>
            <h3>${item.title}</h3>
            <del class="originPrice">NT$${toThousands(item.origin_price)}</del>
            <p class="nowPrice">NT$${toThousands(item.price)}</p>
        </li> `;
    return content;
    

}

// 渲染產品列表
function renderProductList(){
    let str = "";
        productData.forEach(function(item){
            str += combineProductHTMLItem(item);

        })
        productList.innerHTML = str;
}

let productData = [];
let cartData = [];

// 讀取產品 api
function getProductList(){
    axios.get(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}/products`).then(function(response){
        productData = response.data.products;
        // console.log(productData);
        renderProductList();
        

    })
}

// 產品下拉選單的篩選功能
productSelect.addEventListener('change',function(e){
    const category = e.target.value;
    if (category =="全部"){
        renderProductList();
        return;
    }
    let str = "";
    productData.forEach(function(item){
        if (item.category ==category){
            
            str += combineProductHTMLItem(item);
        }
    })
    productList.innerHTML = str;

})

// 綁定加入購物車 btn 的監聽事件
// 監聽的行為要把新增的 productId 和數量給取出來，帶到 post 購物車 api 去用
productList.addEventListener('click',function(e){
    e.preventDefault();
    const addCartClass = e.target.getAttribute("class");
    if (addCartClass !=="js-addCart"){
        return
    }
    const productId =e.target.getAttribute("data-id");
    
    // ask! 這邊的條件可以只寫有點到 btn 一個條件就好嗎
    // if(addCartClass == "js-addCart"){
    //     alert("你有成功加入到購物車");
    // }
    let numCheck = 1;
    cartData.forEach(function(item){
        if(item.product.id === productId){
            numCheck = item.quantity +=1;
        }
    })

 
    // post 購物車 api
    axios.post(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}/carts`,{
        "data": {
          "productId": productId,
          "quantity": numCheck
        }
      }).then(function(response){
        alert("你有成功加入到購物車");
        getCartList();
      })
    
   
})


// 取得購物車 api 資料
function getCartList(){
    axios.get(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}/carts`).then(function(response){
        cartData = response.data.carts;
        // 總金額的資料
        // console.log(response.data.finalTotal);
        const totalPrice = document.querySelector('.js-total');
        totalPrice.textContent = toThousands(response.data.finalTotal);
        
        let str = "";
        cartData.forEach(function(item){
            content = `<tr>
            <td>
                <div class="cardItem-title">
                    <img src="${item.product.images}" alt="">
                    <p>${item.product.title}</p>
                </div>
            </td>
            <td>NT$${toThousands(item.product.price)}</td>
            <td>${item.quantity}</td>
            <td>NT$${toThousands(item.product.price * item.quantity)}</td>
            <td class="discardBtn">
                <a href="#" data-id=${item.id} class="material-icons">
                    clear
                </a>
            </td>
            </tr>`;
            str += content;
        })
        
        cartList.innerHTML = str;

    })
}    

// 刪除單筆購物車資料
cartList.addEventListener('click',function(e){
    e.preventDefault();
    const cardId = e.target.getAttribute('data-id');
    if (cardId ==null){
        alert("你沒有點到刪除按鈕喔");
        return;
    }
    axios.delete(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}/carts/${cardId}`).then(function(response){
        alert("刪除該筆購物車資料成功");
        getCartList();

    })

})

// 刪除全部購物車資料
const discardAllBtn = document.querySelector('.discardAllBtn');
discardAllBtn.addEventListener('click',function(e){
    e.preventDefault();
    axios.delete(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}/carts`).then(function(response){
        alert("刪除全部購物車資料成功");
        getCartList();

    })
    .catch(function(response){
        alert("購物車已經空，請勿重複點擊");
    })
})

// 送出訂單
// 訂單驗證：1.有加入購物車 2.表單欄位都有填寫

const orderInfoBtn = document.querySelector('.orderInfo-btn');
const form = document.querySelector('.orderInfo-form');
orderInfoBtn.addEventListener('click',function(e){
    e.preventDefault();
    if (cartData.length ==0){
        alert("請加入購物車");
        return;
    }
    const customerName = document.querySelector('#customerName').value;
    const customerPhone = document.querySelector('#customerPhone').value;
    const customerEmail = document.querySelector('#customerEmail').value;
    const customerAddress = document.querySelector('#customerAddress').value;
    const customerTradeWay = document.querySelector('#tradeWay').value;
    if(customerName =="" || customerPhone =="" || customerEmail =="" || customerAddress =="" || customerTradeWay =="" ){
        alert("請輸入訂單資訊");
        return;
    }
    axios.post(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}/orders`,{
        "data": {
          "user": {
            "name": customerName,
            "tel": customerPhone,
            "email": customerEmail,
            "address": customerAddress,
            "payment": customerTradeWay
          }
        }
      }).then(function(response){
          alert("訂單送出成功");
       
         // 一鍵清除所有 input
        form.reset();
         //   清除 input
        //   document.querySelector('#customerName').value ="";
        //   document.querySelector('#customerPhone').value ="";
        //   document.querySelector('#customerEmail').value ="";
        //   document.querySelector('#customerAddress').value ="";
        //   document.querySelector('#tradeWay').value ="ATM";

          getCartList();
      })
    

})

// util js、元件
function toThousands(x) {
    let parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}


// 表單驗證
const inputs = document.querySelectorAll("input[name],select[data=payment]");

const constraints = {
  "姓名": {
    presence: {
      message: "必填欄位"
    }
  },
  "電話": {
    presence: {
      message: "必填欄位"
    },
    length: {
      minimum: 8,
      message: "需超過 8 碼"
    }
  },
  "信箱": {
    presence: {
      message: "必填欄位"
    },
    email: {
      message: "格式錯誤"
    }
  },
  "寄送地址": {
    presence: {
      message: "必填欄位"
    }
  },
  "交易方式": {
    presence: {
      message: "必填欄位"
    }
  },
};


inputs.forEach((item) => {
  item.addEventListener("change", function () {
    
    item.nextElementSibling.textContent = '';
    let errors = validate(form, constraints) || '';
    console.log(errors)

    if (errors) {
      Object.keys(errors).forEach(function (keys) {
        // console.log(document.querySelector(`[data-message=${keys}]`))
        document.querySelector(`[data-message="${keys}"]`).textContent = errors[keys];
      })
    }
  });
});
