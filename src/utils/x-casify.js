export const camelcasify = obj => _.mapKeys(obj, (value, key) => _.camelCase(key));

export const upperCamelCasify = obj => _.mapKeys(obj, (value, key) => _.upperFirst(_.camelCase(key)));
