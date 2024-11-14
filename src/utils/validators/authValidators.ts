import Joi from "joi";

interface ISignUpData {
  email: string;
  password: string;
  userType: string;
}

interface ISignInData {
  email: string;
  password: string;
}

interface IPassword {
  password: string;
}

const signUpValidation = (data: ISignUpData) => {
  const schema = Joi.object({
    password: Joi.string()
      .min(9)
      .required()
      .pattern(new RegExp("^(?=.*[0-9]).{9,}$")),
    email: Joi.string().required().email(),
    userType: Joi.string().required(),
  });
  return schema.validate(data);
};




const signInValidation = (data: ISignInData) => {
  const schema = Joi.object({
    password: Joi.string()
      .min(9)
      .pattern(new RegExp("^(?=.*[0-9]).{9,}$")),
    email: Joi.string().required().email(),
  });
  return schema.validate(data);
};

const validatePassword = (password: IPassword) => {
  const schema = Joi.object({
    password: Joi.string()
      .min(9)
      .required()
      .pattern(new RegExp("^(?=.*[0-9]).{9,}$")),
  });
  return schema.validate(password);

}

export {
  signInValidation,
  signUpValidation,
  validatePassword
};

