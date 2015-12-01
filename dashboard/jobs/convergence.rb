# Populate the graph with some random points

require "rubygems"
require "json"
require "net/http"
require "uri"

def get_data
  uri = URI.parse("http://localhost:3000/user/1/devices/1/results")

  http = Net::HTTP.new(uri.host,uri.port)
  request = Net::HTTP::Get.new(uri.request_uri)

  response=http.request(request)
  res=JSON.parse(response.body)

  index = 0
  result = []
  res.map do |data|
    index = index + 1
    result.push({x: index , y: data["temperature"].to_i})
  end
  return result
end

SCHEDULER.every '2s' do
  points=get_data
  print points
  send_event('tempdata', points: points)
end
