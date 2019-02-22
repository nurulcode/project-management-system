module.exports = {

  isLoggedIn : (req, res, next)=>{
    if(!req.session.user){
      return res.redirect('/')
    }
    next()
  },


get7Dates: function () {
  let date = new Date();
  let dates = [];
  let year, month, day;

  for (var i = 0; i < 7; i++) {
    year = date.getFullYear(); month = date.getMonth() + 1; day = date.getDate();
    if (day < 10) {
      day = '0' + day;
    }
    if (month < 10) {
      month = '0' + month;
    }
    dates.push(`${year}-${month}-${day}`);
    date.setDate(date.getDate() - 1);
  }
  return dates;
},

  get7Days: function () {
    let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let index = new Date().getDay();
    let fixedDays = []; for (var i = 0; i < 7; i++) {

      if (index < 0) index = 6;
      fixedDays.push(days[index]); index--;

    }
    return fixedDays;
  }

}
