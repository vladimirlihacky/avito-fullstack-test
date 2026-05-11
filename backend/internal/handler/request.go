package handler

import (
	"encoding/json"
	"net/http"
	"net/url"
	"strconv"
)

func readJSONBody(req *http.Request, dest any) error {
	return json.NewDecoder(req.Body).Decode(dest)
}

func queryGetInt(q url.Values, key string, defaultVal int) int {
	val := q.Get(key)
	if res, err := strconv.Atoi(val); err == nil {
		return res
	}
	return defaultVal
}

func queryGetBool(q url.Values, key string, defaultVal bool) bool {
	val := q.Get(key)
	if res, err := strconv.ParseBool(val); err == nil {
		return res
	}
	return defaultVal
}
