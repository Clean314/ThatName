var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

var userSchema = mongoose.Schema({
  user_id:{
    type:String,
    required:[true,'아이디가 입력되어야합니다.'],
    match:[/^.{4,12}$/,'아이디는 4-12자로 입력하세요.'],
    trim:true,
    unique:true
  },
  password:{
    type:String,
    required:[true,'비밀번호가 입력되어야합니다.'],
    select:false
  },
  nickname:{
    type:String,
    required:[true,'닉네임이 입력되어야합니다.'],
    match:[/^.{4,12}$/,'닉네임은 4-12자로 입력하세요.'],
    trim:true
  },
  email:{
    type:String,
    match:[/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,'올바른 이메일 주소를 입력하세요.'],
    trim:true
  },
  solved:{
    type:Array
  }
},{
  toObject:{virtuals:true}
});

// virtuals
userSchema.virtual('passwordConfirmation')
  .get(function(){ return this._passwordConfirmation; })
  .set(function(value){ this._passwordConfirmation=value; });

userSchema.virtual('originalPassword')
  .get(function(){ return this._originalPassword; })
  .set(function(value){ this._originalPassword=value; });

userSchema.virtual('currentPassword')
  .get(function(){ return this._currentPassword; })
  .set(function(value){ this._currentPassword=value; });

userSchema.virtual('newPassword')
  .get(function(){ return this._newPassword; })
  .set(function(value){ this._newPassword=value; });

// password validation
var passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/;
var passwordRegexErrorMessage = '비밀번호는 8~16자리이고, 영어와 숫자가 한 개 이상 포함되어야합니다.';
userSchema.path('password').validate(function(v) {
  var user = this;

  // create user
  if(user.isNew){
    if(!user.passwordConfirmation){
      user.invalidate('passwordConfirmation', '비밀번호 확인이 입력되어야합니다.');
    }

    if(!passwordRegex.test(user.password)){
      user.invalidate('password', passwordRegexErrorMessage);
    }
    else if(user.password !== user.passwordConfirmation) {
      user.invalidate('passwordConfirmation', '비밀번호와 비번 확인이 다릅니다.');
    }
  }

  // update user
  // if(!user.isNew){
  //   if(!user.currentPassword){
  //     user.invalidate('currentPassword', 'Current Password is required!');
  //   }
  //   else if(!bcrypt.compareSync(user.currentPassword, user.originalPassword)){
  //     user.invalidate('currentPassword', 'Current Password is invalid!');
  //   }
  //
  //   if(user.newPassword && !passwordRegex.test(user.newPassword)){
  //     user.invalidate("newPassword", passwordRegexErrorMessage);
  //   }
  //   else if(user.newPassword !== user.passwordConfirmation) {
  //     user.invalidate('passwordConfirmation', 'Password Confirmation does not matched!');
  //   }
  // }
});

// hash password
userSchema.pre('save', function (next){
  var user = this;
  if(!user.isModified('password')){
    return next();
  }
  else {
    user.password = bcrypt.hashSync(user.password);
    return next();
  }
});

// model methods
userSchema.methods.authenticate = function (password) {
  var user = this;
  return bcrypt.compareSync(password,user.password);
};

// model & export
var User = mongoose.model('user',userSchema);
module.exports = User;
