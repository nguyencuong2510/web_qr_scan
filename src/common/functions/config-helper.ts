import { TransformFnParams } from 'class-transformer';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { ConfigObject, registerAs } from '@nestjs/config';

/**
 *
 * @param token
 * @param envClass
 * @param rawConfig
 * @param mapValue
 * @returns
 */
export const registerAsWithValidation = <
  T extends ConfigObject,
  E extends ClassConstructor<unknown>,
>(
  token: string,
  envClass: E,
  rawConfig: Record<string, unknown>,
  mapValue: (envInstance: InstanceType<E>) => T,
) =>
  registerAs(token, (): T => {
    const validatedConfig = plainToInstance(envClass, rawConfig, {
      enableImplicitConversion: true,
      excludeExtraneousValues: true,
    });
    const errors = validateSync(validatedConfig as object, {
      skipMissingProperties: false,
    });

    if (errors.length > 0) {
      throw new Error(errors.toString());
    }

    return mapValue(validatedConfig as InstanceType<E>);
  });

/**
 *
 * @param eachTypeFn
 * @returns
 */
export const splitByCommaTranformer = <T = string>(
  eachTypeFn?: (val: string) => T,
) => {
  return (params: TransformFnParams) => {
    if (typeof params.value === 'string') {
      const res = params.value.split(',');
      if (eachTypeFn) {
        return res.map((val) => eachTypeFn(val));
      }
      return res;
    }

    throw new Error(
      `value is not string to be splitted by comma: ${params.value}`,
    );
  };
};
