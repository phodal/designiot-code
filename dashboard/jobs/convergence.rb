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
  result=JSON.parse(response.body)

  index = 0
  result.map do |data|
    index = index + 1
    {x: index , y: data["temperature"].to_i}
  end
end

SCHEDULER.every '2s' do
  points=get_data
  p points
  send_event('tempdata', points: points)
end
