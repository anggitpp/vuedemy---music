import {
  configure,
  defineRule,
  ErrorMessage,
  Field as VeeField,
  Form as VeeForm,
} from "vee-validate";
import {
  alpha_spaces as alphaSpaces,
  confirmed,
  email,
  max,
  max_value as maxValue,
  min,
  min_value as minValue,
  not_one_of as excluded,
  numeric,
  required,
} from "@vee-validate/rules";

export default {
  install(app) {
    app.component("VeeForm", VeeForm);
    app.component("VeeField", VeeField);
    app.component("ErrorMessage", ErrorMessage);

    defineRule("required", required);
    defineRule("tos", required);
    defineRule("min", min);
    defineRule("max", max);
    defineRule("alpha_spaces", alphaSpaces);
    defineRule("email", email);
    defineRule("numeric", numeric);
    defineRule("min_value", minValue);
    defineRule("max_value", maxValue);
    defineRule("password_mismatch", confirmed);
    defineRule("excluded", excluded);
    defineRule("country_excluded", excluded);

    configure({
      generateMessage: (ctx) => {
        const messages = {
          required: `The field ${ctx.field} is required`,
          min: `The field ${ctx.field} must be at least ${ctx.value.length} characters`,
          max: `The field ${ctx.field} cannot be more than ${ctx.value.length} characters`,
          alpha_spaces: `The field  ${ctx.field} may only contain alphabetic characters and spaces`,
          email: `The field  ${ctx.field} must be a valid email`,
          numeric: `The field  ${ctx.field} may only contain numeric characters`,
          min_value: `The field  ${ctx.field} must be at least ${ctx.value.min}`,
          max_value: `The field  ${ctx.field} cannot be more than ${ctx.value.max}`,
          password_mismatch: `${ctx.field} confirmation does not match`,
          excluded: `You are not allowed to use this value for the field${ctx.field}`,
          country_excluded: `We do not ship to ${ctx.value}`,
          tos: `You must agree to the terms and conditions`,
        };

        return messages[ctx.rule.name]
          ? messages[ctx.rule.name]
          : `This field ${ctx.field} is invalid`;
      },
      validateOnBlur: true,
      validateOnChange: true,
      validateOnInput: false,
      validateOnModelUpdate: true,
    });
  },
};
