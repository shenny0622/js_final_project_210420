

const orderList = document.querySelector('.js-orderList');
let orderData = [];

// 初始化
function init(){
    getOrderList();

}
init();

// C3 圖表
function renderC3(){
    // 物件資料搜集
    let total = {};
    orderData.forEach(function(item){
        item.products.forEach(function(productItem){
            if (total[productItem.category] == undefined){
                total[productItem.category] = productItem.price * productItem.quantity;
            }else{
                total[productItem.category] += productItem.price * productItem.quantity;
            }
        })
    })
    console.log(total);
    // 做出資料關聯
    let categoryAry = Object.keys(total);
    console.log(categoryAry);

    // 組出  C3.js 資料格式
    let newData = [];
    categoryAry.forEach(function(item){
        let ary = [];
        ary.push(item);
        ary.push(total[item]);
        newData.push(ary);
    })
    console.log(newData);

    // C3.js
    let chart = c3.generate({
    bindto: '#chart', // HTML 元素綁定
    data: {
        type: "pie",
        columns: newData
        
    },
});
}

function renderC3_lv2(){
    // 物件資料搜集
    let obj = {};
    orderData.forEach(function(item){
        item.products.forEach(function(productItem){
            if (obj[productItem.category] === undefined){
                obj[productItem.category] = productItem.price * productItem.quantity;
            }else{
                obj[productItem.category] += productItem.price * productItem.quantity;
            }
        })
    })
    console.log(obj);

    // 拉出資料關聯
    let originAry = Object.keys(obj);
    console.log(originAry);

    // 透過 originAry 整理成 C3 資料
    let rankSortAry = [];
    originAry.forEach(function(item){
        let ary = [];
        ary.push(item);
        ary.push(obj[item]);
        rankSortAry.push(ary);

    })
    console.log(rankSortAry);
     // 比大小，降冪排列（目的：取營收前三高的品項當主要色塊，把其餘的品項加總起來當成一個色塊）
  // sort: https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
    rankSortAry.sort(function(a,b){
        return b[1] -a[1];
    })

 // 如果筆數超過 4 筆以上，就統整為其它
    if(rankSortAry.length > 3){
        let othersTotal = 0;
        rankSortAry.forEach(function(index){
            // 排名資料有三筆
            if (index >2){
                othersTotal += rankSortAry[index][1];
            }
        })
        rankSortAry.splice(3,rankSortAry.length-1);
        rankSortAry.push(['其他',othersTotal]);
    }
    
    
     // 超過三筆後將第四名之後的價格加總起來放在 othersTotal
     // c3 圖表
    c3.generate({
    bindto: '#chart',
    data: {
      columns: rankSortAry,
      type: 'pie',
    },
    color: {
      pattern: ["#301E5F", "#5434A7", "#9D7FEA", "#DACBFF"]
    }
  });
}

// 取得後台訂單
function getOrderList(){
    axios.get(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin/${api_path}/orders`,{
        headers:{
            'Authorization':token,
        }
    }).then(function(response){
        orderData = response.data.orders;

        // 組訂單字串
        let str ="";
        orderData.forEach(function(item){
            // 組時間字串
            const timeStamp = new Date(item.createdAt*1000);
            const orderTime = `${timeStamp.getFullYear()}/${timeStamp.getMonth()+1}/${timeStamp.getDate()}`
            // 組產品字串
            let productStr = "";
            item.products.forEach(function(productItem){
                productStr +=`<p>${productItem.title}x${productItem.quantity}</p>`
            })

            // 判斷訂單處理狀態
            // ask!
            let orderStatus ="";
            if(item.paid==true){
                orderStatus="已處理";
            }else{
                orderStatus="未處理"
            }

            // 組訂單字串
            content = ` <tr>
            <td>${item.id}</td>
            <td>
              <p>${item.user.name}</p>
              <p>${item.user.tel}</p>
            </td>
            <td>${item.user.address}</td>
            <td>${item.user.email}</td>
            <td>
              <p>${productStr}</p>
            </td>
            <td>${orderTime}</td>
            <td class="orderStatus">
              <a href="#" data-status ="${item.paid}" class="js-orderStatus" data-id ="${item.id}" >${orderStatus}</a>
            </td>
            <td>
              <input type="button" class="delSingleOrder-Btn js-orderDelete" data-id ="${item.id}" value="刪除">
            </td>
        </tr>`;
        str +=content;
        })
        orderList.innerHTML=str;
        renderC3_lv2();
    })
}


orderList.addEventListener('click',function(e){
    e.preventDefault();
    const targetClass = e.target.getAttribute("class");
    let id = e.target.getAttribute("data-id");
    // 刪除後台訂單
    if (targetClass == "delSingleOrder-Btn js-orderDelete"){
        deleteOrderItem(id);
        return;
    }
    // 修改訂單狀態
    if (targetClass == "js-orderStatus"){
        let status = e.target.getAttribute("data-status");
        
        changeOrderStatus(status,id)
        return;
    }

})

// 修改訂單狀態
function changeOrderStatus(status,id){
    let newStatus;
    // ask!
    if(status == "true"){
        newStatus =false;
    }else{
        newStatus =true;
    }

    axios.put(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin/${api_path}/orders`,{
        "data": {
          "id": id,
          "paid": newStatus
        }
      },{
        headers:{
            'Authorization':token,
        }
    }).then(function(response){
        alert("修改訂單狀態成功");
        getOrderList();
    })

}

// 刪除後台訂單
function deleteOrderItem(id){
    axios.delete(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin/${api_path}/orders/${id}`,{
        headers:{
            'Authorization':token,
        }
    }).then(function(response){
        alert("刪除該筆訂單成功");
        getOrderList();
    })

}

// 刪除後台全部訂單
const discardAllBtn = document.querySelector(".discardAllBtn");
discardAllBtn.addEventListener("click",function(e){
  e.preventDefault();
  axios.delete(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin/${api_path}/orders`, {
    headers: {
      'Authorization': token,
    }
  })
    .then(function (response) {
      alert("刪除全部訂單成功");
      getOrderList();
    })
})
